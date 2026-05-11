from __future__ import annotations

import json
import logging
import os
from itertools import combinations

from langchain_ollama import OllamaLLM

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
llm_smart = OllamaLLM(model="mistral:7b", base_url=OLLAMA_BASE_URL)


# ── Archetype matrix ───────────────────────────────────────────────────────

ARCHETYPE_SCORES: dict[tuple[str, str], float] = {
    ("Visionary", "Engineer"): 1.0,
    ("Visionary", "Builder"): 1.0,
    ("Visionary", "Operator"): 1.0,
    ("CEO", "Engineer"): 1.0,
    ("CEO", "Builder"): 1.0,
    ("CEO", "Operator"): 1.0,
    ("Hustler", "Engineer"): 1.0,
    ("Hustler", "Builder"): 1.0,
    ("Seller", "Engineer"): 1.0,
    ("Seller", "Builder"): 1.0,
    ("Marketer", "Engineer"): 1.0,
    ("DomainExpert", "Builder"): 1.0,
    ("ProductDesigner", "Engineer"): 1.0,
    ("Visionary", "Visionary"): 0.1,
    ("CEO", "CEO"): 0.1,
    ("Engineer", "Engineer"): 0.2,
}

SOFT_WEIGHTS = {
    "skill_complementarity": 0.40,
    "industry_alignment": 0.25,
    "business_model_fit": 0.10,
    "archetype_fit": 0.15,
    "values_alignment": 0.10,
}

assert abs(sum(SOFT_WEIGHTS.values()) - 1.0) < 1e-9, "SOFT_WEIGHTS must sum to 1.0"


# ── Hard filters ───────────────────────────────────────────────────────────

def passes_hard_filters(a: dict, b: dict) -> bool:
    la = a.get("logistics", {})
    lb = b.get("logistics", {})
    va = a.get("venture", {})
    vb = b.get("venture", {})

    # No self-match
    if a.get("founder_id") == b.get("founder_id"):
        return False

    # Geography
    if not la.get("remote_ok") and not lb.get("remote_ok"):
        if la.get("location") != lb.get("location"):
            return False

    # Commitment
    if la.get("commitment") == "full_time" and lb.get("commitment") == "side_hustle":
        return False
    if la.get("commitment") == "side_hustle" and lb.get("commitment") == "full_time":
        return False

    # Funding philosophy
    fp_a = va.get("funding_philosophy")
    fp_b = vb.get("funding_philosophy")
    if (fp_a == "vc_track" and fp_b == "bootstrapping") or \
       (fp_a == "bootstrapping" and fp_b == "vc_track"):
        return False

    return True


# ── Soft scoring ───────────────────────────────────────────────────────────

def score_skill_complementarity(a: dict, b: dict) -> float:
    ra = a.get("role", {})
    rb = b.get("role", {})
    a_gives_b = ra.get("primary_skill") in (rb.get("looking_for") or [])
    b_gives_a = rb.get("primary_skill") in (ra.get("looking_for") or [])
    if a_gives_b and b_gives_a:
        return 1.0
    if a_gives_b or b_gives_a:
        return 0.5
    return 0.1


def score_industry_alignment(a: dict, b: dict) -> float:
    ia = set(a.get("venture", {}).get("industry") or [])
    ib = set(b.get("venture", {}).get("industry") or [])
    if not ia or not ib:
        return 0.3
    overlap = len(ia & ib) / max(len(ia | ib), 1)
    return min(1.0, overlap + 0.2)


def score_business_model(a: dict, b: dict) -> float:
    bm_a = a.get("venture", {}).get("business_model")
    bm_b = b.get("venture", {}).get("business_model")
    if bm_a == bm_b:
        return 1.0
    adjacent = {("b2b", "b2b2c"), ("b2c", "b2b2c"), ("b2b2c", "marketplace")}
    if (bm_a, bm_b) in adjacent or (bm_b, bm_a) in adjacent:
        return 0.6
    return 0.2


def score_archetype_fit(a: dict, b: dict) -> float:
    arch_a = (a.get("archetypes") or {}).get("primary")
    arch_b = (b.get("archetypes") or {}).get("primary")
    if not arch_a or not arch_b:
        return 0.5
    key = (arch_a, arch_b)
    rev = (arch_b, arch_a)
    return ARCHETYPE_SCORES.get(key, ARCHETYPE_SCORES.get(rev, 0.5))


def score_values(a: dict, b: dict) -> float:
    pa = a.get("psychographics", {})
    pb = b.get("psychographics", {})

    risk_a = pa.get("risk_tolerance") or 5
    risk_b = pb.get("risk_tolerance") or 5
    wlb_a = pa.get("work_life_balance") or 5
    wlb_b = pb.get("work_life_balance") or 5

    risk_score = max(0, 1 - abs(risk_a - risk_b) / 5)
    wlb_score = max(0, 1 - abs(wlb_a - wlb_b) / 4)
    goal_match = 1.0 if pa.get("ultimate_goal") == pb.get("ultimate_goal") else 0.4

    return risk_score * 0.35 + wlb_score * 0.35 + goal_match * 0.30


def compute_soft_score(a: dict, b: dict) -> float:
    scores = {
        "skill_complementarity": score_skill_complementarity(a, b),
        "industry_alignment": score_industry_alignment(a, b),
        "business_model_fit": score_business_model(a, b),
        "archetype_fit": score_archetype_fit(a, b),
        "values_alignment": score_values(a, b),
    }
    total = sum(scores[k] * SOFT_WEIGHTS[k] for k in SOFT_WEIGHTS)
    return round(total * 100, 2)


# ── LLM match thesis ───────────────────────────────────────────────────────

THESIS_PROMPT = """You are a co-founder matching advisor at a VC firm.
Given two founder profiles, write a concise match thesis.

Founder A: {summary_a}
Founder B: {summary_b}

Output ONLY valid JSON, no preamble, no markdown fences:
{{
  "match_thesis": "2 sentences explaining why this pair is interesting, focus on complementarity",
  "main_concern": "1 sentence about the biggest risk or concern, or null",
  "recommendation": "strong | moderate | weak"
}}"""


def get_match_thesis(a: dict, b: dict, score: float) -> dict:
    try:
        summary_a = (a.get("llm_summary") or
                     f"{(a.get('archetypes') or {}).get('primary')} founder, "
                     f"{(a.get('role') or {}).get('primary_skill')} background")
        summary_b = (b.get("llm_summary") or
                     f"{(b.get('archetypes') or {}).get('primary')} founder, "
                     f"{(b.get('role') or {}).get('primary_skill')} background")

        prompt = THESIS_PROMPT.format(summary_a=summary_a, summary_b=summary_b)
        raw = llm_smart.invoke(prompt).strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        thesis = json.loads(raw)

        # Override recommendation based on score
        if score >= 75:
            thesis["recommendation"] = "strong"
        elif score >= 60:
            thesis["recommendation"] = "moderate"
        else:
            thesis["recommendation"] = "weak"

        return thesis
    except Exception as e:
        logger.warning(f"Thesis generation failed: {e}")
        rec = "strong" if score >= 75 else "moderate" if score >= 60 else "weak"
        return {"match_thesis": None, "main_concern": None, "recommendation": rec}


# ── Main matching function ─────────────────────────────────────────────────

def run_matching(event_id: str | None = None) -> list[dict]:
    from db.supabase_client import get_supabase
    db = get_supabase()

    # Fetch active profiles
    profiles_result = db.table("founder_profiles") \
        .select("*, founders!inner(status, email, full_name)") \
        .execute()

    profiles = [
        row["profile_json"]
        for row in profiles_result.data
        if row.get("profile_json") and
        row.get("founders", {}).get("status") in ("profiled", "Searching now")
    ]

    if len(profiles) < 2:
        logger.info("Not enough profiles to match")
        return []

    # Fetch already introduced pairs
    intros = db.table("introductions") \
        .select("founder_a_id, founder_b_id").execute()
    introduced = {
        (r["founder_a_id"], r["founder_b_id"])
        for r in intros.data
    } | {
        (r["founder_b_id"], r["founder_a_id"])
        for r in intros.data
    }

    # Fetch pending match counts per founder
    pending = db.table("matches") \
        .select("founder_a_id, founder_b_id") \
        .eq("status", "pending_review").execute()

    pending_counts: dict[str, int] = {}
    for row in pending.data:
        pending_counts[row["founder_a_id"]] = pending_counts.get(row["founder_a_id"], 0) + 1
        pending_counts[row["founder_b_id"]] = pending_counts.get(row["founder_b_id"], 0) + 1

    results = []

    for a, b in combinations(profiles, 2):
        fid_a = a.get("founder_id")
        fid_b = b.get("founder_id")

        if not fid_a or not fid_b:
            continue

        # Skip if already introduced
        if (fid_a, fid_b) in introduced:
            continue

        # Skip if max pending reached
        if pending_counts.get(fid_a, 0) >= 3 or pending_counts.get(fid_b, 0) >= 3:
            continue

        # Hard filters
        if not passes_hard_filters(a, b):
            logger.info(f"Hard filter eliminated: {fid_a} x {fid_b}")
            continue

        # Soft score
        score = compute_soft_score(a, b)

        # LLM thesis for score >= 60
        thesis_data = {"match_thesis": None, "main_concern": None, "recommendation": "weak"}
        if score >= 60:
            thesis_data = get_match_thesis(a, b, score)

        match_row = {
            "founder_a_id": fid_a,
            "founder_b_id": fid_b,
            "score": score,
            "recommendation": thesis_data.get("recommendation"),
            "match_thesis": thesis_data.get("match_thesis"),
            "main_concern": thesis_data.get("main_concern"),
            "status": "pending_review",
            "event_id": event_id,
        }

        db.table("matches").insert(match_row).execute()
        pending_counts[fid_a] = pending_counts.get(fid_a, 0) + 1
        pending_counts[fid_b] = pending_counts.get(fid_b, 0) + 1

        results.append(match_row)
        logger.info(f"Match created: {fid_a} x {fid_b} score={score}")

    return results