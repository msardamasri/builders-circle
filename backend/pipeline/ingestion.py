from __future__ import annotations

import json
import logging
import os
from typing import TypedDict

from langchain_ollama import OllamaLLM
from langgraph.graph import StateGraph, END

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

llm_fast = OllamaLLM(model="llama3.2:3b", base_url=OLLAMA_BASE_URL)
llm_smart = OllamaLLM(model="mistral:7b", base_url=OLLAMA_BASE_URL)


# ── State ──────────────────────────────────────────────────────────────────

class IngestionState(TypedDict):
    founder_id: str
    raw_form_json: dict
    cleaned_summary: str | None
    profile_json: dict | None
    error: str | None


# ── Node 1: clean_transcript ───────────────────────────────────────────────

CLEAN_PROMPT = """You extract key signals from a founder's interview transcript or free-text bio.
Output plain text under 300 words. Include only:
- Vision statements ("I want to build X because Y")
- Risk/commitment signals ("I quit my job", "I have 12 months runway")
- Working style signals ("I prefer async", "I need a technical co-founder immediately")
- Red flags if any ("I'm not ready to give up equity", "this is just a side project")
Remove: filler words, pleasantries, repeated ideas, off-topic content.
Do not add interpretation. Extract only. Output plain text, no headers.

Founder input:
{raw_text}"""


def clean_transcript(state: IngestionState) -> IngestionState:
    try:
        raw = state["raw_form_json"]
        # Combine all free-text fields into one block for the LLM
        raw_text = "\n\n".join([
            f"Vision / idea: {raw.get('idea_vision', '')}",
            f"Ideal co-founder: {raw.get('ideal_cofounder', '')}",
            f"Main concern: {raw.get('main_concern', '')}",
            f"Background: {raw.get('background', '')}",
        ])
        prompt = CLEAN_PROMPT.format(raw_text=raw_text)
        cleaned = llm_fast.invoke(prompt)
        logger.info(f"[{state['founder_id']}] Node 1 complete")
        return {**state, "cleaned_summary": cleaned}
    except Exception as e:
        logger.error(f"[{state['founder_id']}] Node 1 failed: {e}")
        return {**state, "error": f"node1_failed: {e}"}


# ── Node 2: synthesize_profile ─────────────────────────────────────────────

PROFILE_SCHEMA = """{
  "founder_id": "uuid string",
  "processed_at": "ISO8601 datetime string",
  "logistics": {
    "location": "city string",
    "remote_ok": true,
    "commitment": "full_time | side_hustle | planning",
    "hours_per_week": 40,
    "runway_months": 6
  },
  "role": {
    "primary_skill": "tech | sales | ops | product | design | finance",
    "looking_for": ["tech", "sales"],
    "years_experience": 5,
    "founder_history": "first_timer | serial | exited"
  },
  "venture": {
    "industry": ["fintech", "ai"],
    "business_model": "b2b | b2c | b2b2c | marketplace",
    "time_to_mvp": "1m | 3m | 6m | 12m",
    "funding_philosophy": "vc_track | bootstrapping | open",
    "idea_stage": "committed | exploratory"
  },
  "psychographics": {
    "risk_tolerance": 7,
    "work_life_balance": 5,
    "decision_style": "consensus | ceo_led | data_driven",
    "conflict_style": "direct | mediated | analytical",
    "ultimate_goal": "unicorn | lifestyle | impact",
    "social_battery": "introvert | extrovert | ambivert"
  },
  "archetypes": {
    "primary": "Visionary",
    "secondary": "Engineer",
    "confidence": 0.85
  },
  "llm_summary": "150 word plain text summary"
}"""

SYNTH_PROMPT = """You are a founder psychologist at a VC firm.
Given a cleaned transcript summary and structured form data, output ONLY valid JSON matching this exact schema:

{schema}

Rules:
- All fields required. Use null for truly unknown, not empty strings.
- archetype list is fixed: Visionary, Builder, Hustler, Operator, CEO, Seller, DomainExpert, Generalist, ProductDesigner, Marketer, Engineer, Hacker
- psychographics scores 1-10 derived from text signals, not self-report.
- llm_summary: 1 paragraph, what makes this founder unique + main risk, max 150 words.
- idea_stage: "committed" if they have specific product/market. "exploratory" if still searching.
- Use the founder_id: {founder_id}
- Use processed_at: {processed_at}
Output ONLY the JSON object. No preamble, no markdown fences, no explanation.

Cleaned transcript:
{cleaned_summary}

Structured form fields:
{structured_fields}"""


def synthesize_profile(state: IngestionState) -> IngestionState:
    if state.get("error"):
        return state
    try:
        from datetime import datetime, timezone
        raw = state["raw_form_json"]
        structured = {k: v for k, v in raw.items()
                      if k not in ("idea_vision", "ideal_cofounder", "main_concern", "background")}
        prompt = SYNTH_PROMPT.format(
            schema=PROFILE_SCHEMA,
            founder_id=state["founder_id"],
            processed_at=datetime.now(timezone.utc).isoformat(),
            cleaned_summary=state["cleaned_summary"],
            structured_fields=json.dumps(structured, indent=2),
        )
        raw_output = llm_smart.invoke(prompt)

        # Strip markdown fences if model adds them anyway
        clean_output = raw_output.strip()
        if clean_output.startswith("```"):
            clean_output = clean_output.split("```")[1]
            if clean_output.startswith("json"):
                clean_output = clean_output[4:]

        profile = json.loads(clean_output)
        logger.info(f"[{state['founder_id']}] Node 2 complete")
        return {**state, "profile_json": profile}

    except json.JSONDecodeError as e:
        logger.warning(f"[{state['founder_id']}] Node 2 JSON parse failed, retrying: {e}")
        return _retry_synthesis(state)
    except Exception as e:
        logger.error(f"[{state['founder_id']}] Node 2 failed: {e}")
        return {**state, "error": f"node2_failed: {e}"}


def _retry_synthesis(state: IngestionState) -> IngestionState:
    """One retry with explicit JSON repair prompt."""
    try:
        repair_prompt = f"""The previous output was not valid JSON. Output ONLY a valid JSON object.
No markdown, no explanation, no fences. Start with {{ and end with }}.
Use this founder_id: {state['founder_id']}
Transcript: {state['cleaned_summary'][:500]}
Produce the shortest valid JSON matching the founder profile schema."""
        raw = llm_smart.invoke(repair_prompt)
        profile = json.loads(raw.strip())
        return {**state, "profile_json": profile}
    except Exception as e:
        logger.error(f"[{state['founder_id']}] Node 2 retry failed: {e}")
        return {**state, "error": "node2_json_parse_failed"}


# ── Node 3: validate_and_store ─────────────────────────────────────────────

def validate_and_store(state: IngestionState) -> IngestionState:
    from db.supabase_client import get_supabase
    db = get_supabase()

    if state.get("error") == "node1_failed":
        db.table("founders").update({"status": "ingestion_failed"}) \
            .eq("id", state["founder_id"]).execute()
        return state

    if state.get("error") == "node2_json_parse_failed":
        db.table("founder_profiles").insert({
            "founder_id": state["founder_id"],
            "profile_json": {},
            "raw_summary": state.get("cleaned_summary", ""),
            "validated": False,
        }).execute()
        db.table("founders").update({"status": "needs_manual_review"}) \
            .eq("id", state["founder_id"]).execute()
        return state

    try:
        from models.founder import FounderProfile
        profile = FounderProfile(**state["profile_json"])
        validated = True
    except Exception as e:
        logger.warning(f"[{state['founder_id']}] Pydantic validation failed: {e}")
        validated = False

    db.table("founder_profiles").insert({
        "founder_id": state["founder_id"],
        "profile_json": state["profile_json"],
        "raw_summary": state.get("cleaned_summary", ""),
        "validated": validated,
    }).execute()

    db.table("founders").update({"status": "profiled"}) \
        .eq("id", state["founder_id"]).execute()

    logger.info(f"[{state['founder_id']}] Node 3 complete — validated={validated}")
    return state


# ── Build graph ────────────────────────────────────────────────────────────

def build_ingestion_graph():
    graph = StateGraph(IngestionState)
    graph.add_node("clean_transcript", clean_transcript)
    graph.add_node("synthesize_profile", synthesize_profile)
    graph.add_node("validate_and_store", validate_and_store)

    graph.set_entry_point("clean_transcript")
    graph.add_edge("clean_transcript", "synthesize_profile")
    graph.add_edge("synthesize_profile", "validate_and_store")
    graph.add_edge("validate_and_store", END)

    return graph.compile()


ingestion_graph = build_ingestion_graph()


async def run_ingestion(founder_id: str, raw_form_json: dict) -> None:
    """Entry point called from the FastAPI background task."""
    initial_state: IngestionState = {
        "founder_id": founder_id,
        "raw_form_json": raw_form_json,
        "cleaned_summary": None,
        "profile_json": None,
        "error": None,
    }
    ingestion_graph.invoke(initial_state)