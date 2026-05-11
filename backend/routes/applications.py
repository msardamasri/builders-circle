from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/applications", tags=["applications"])


# ── Models ─────────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    user_id: str
    full_name: str
    email: str
    linkedin: str | None = None
    founder_section: dict[str, Any] = {}
    idea_section: dict[str, Any] = {}
    personal_section: dict[str, Any] = {}


class DecisionPayload(BaseModel):
    reason: str | None = None
    dri: str = "b2venture-team"


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_application(payload: ApplicationCreate) -> dict:
    """Public site calls this when a user submits the multi-step form."""
    db = get_supabase()
    deadline = datetime.now(timezone.utc) + timedelta(hours=72)

    try:
        result = db.table("applications").insert({
            "user_id": payload.user_id,
            "full_name": payload.full_name.strip(),
            "email": payload.email.strip().lower(),
            "linkedin": payload.linkedin.strip() if payload.linkedin else None,
            "founder_section": payload.founder_section,
            "idea_section": payload.idea_section,
            "personal_section": payload.personal_section,
            "status": "video_pending",
            "video_deadline": deadline.isoformat(),
        }).execute()
    except Exception as e:
        logger.error(f"Failed to create application: {e}")
        raise HTTPException(status_code=500, detail="Failed to create application")

    return {"status": "accepted", "application_id": result.data[0]["id"]}


@router.get("")
async def list_applications(status: str | None = None) -> dict:
    """Internal controller can call this; reads can also go direct to Supabase."""
    db = get_supabase()
    q = db.table("applications").select("*").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return {"applications": q.execute().data}


@router.get("/{application_id}")
async def get_application(application_id: str) -> dict:
    db = get_supabase()
    result = db.table("applications").select("*").eq("id", application_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return result.data


@router.post("/{application_id}/accept")
async def accept_application(application_id: str, payload: DecisionPayload) -> dict:
    """Internal controller calls this when a DRI accepts an application.
    Creates the corresponding founder + founder_profile rows so the matching
    engine picks them up automatically."""
    db = get_supabase()

    # Fetch the application
    app_res = db.table("applications").select("*").eq("id", application_id).single().execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Application not found")
    app = app_res.data

    # Build a profile_json compatible with the existing matching engine
    profile_json = _build_profile_from_application(app)

    # Insert into founders
    try:
        founder = db.table("founders").insert({
            "email": app["email"],
            "full_name": app["full_name"],
            "raw_form_json": {
                "founder_section": app["founder_section"],
                "idea_section": app["idea_section"],
                "personal_section": app["personal_section"],
            },
            "status": "Searching now",
        }).execute()
        founder_id = founder.data[0]["id"]
    except Exception as e:
        logger.error(f"Failed to insert founder: {e}")
        raise HTTPException(status_code=500, detail="Failed to create founder record")

    # Insert into founder_profiles
    db.table("founder_profiles").insert({
        "founder_id": founder_id,
        "profile_json": profile_json,
        "raw_summary": (app.get("personal_section") or {}).get("motivation"),
        "validated": True,
    }).execute()

    # Update the application
    db.table("applications").update({
        "status": "accepted",
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": payload.dri,
        "founder_id": founder_id,
    }).eq("id", application_id).execute()

    logger.info(f"Application {application_id} accepted → founder {founder_id}")
    return {"status": "accepted", "founder_id": founder_id}


@router.post("/{application_id}/reject")
async def reject_application(application_id: str, payload: DecisionPayload) -> dict:
    db = get_supabase()
    db.table("applications").update({
        "status": "rejected",
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": payload.dri,
        "decision_reason": payload.reason,
    }).eq("id", application_id).execute()
    return {"status": "rejected"}


@router.post("/{application_id}/hold")
async def hold_application(application_id: str, payload: DecisionPayload) -> dict:
    db = get_supabase()
    db.table("applications").update({
        "status": "on_hold",
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": payload.dri,
        "dri_notes": payload.reason,
    }).eq("id", application_id).execute()
    return {"status": "on_hold"}


# ── Helpers ────────────────────────────────────────────────────────────────

def _build_profile_from_application(app: dict) -> dict:
    f = app.get("founder_section") or {}
    i = app.get("idea_section") or {}
    p = app.get("personal_section") or {}

    return {
        "logistics": {
            "location": f.get("location") or "Berlin",
            "remote_ok": f.get("remote_ok", False),
            "commitment": f.get("commitment") or "full_time",
            "hours_per_week": f.get("hours_per_week"),
            "runway_months": f.get("runway_months"),
        },
        "role": {
            "primary_skill": f.get("primary_skill") or "tech",
            "looking_for": f.get("looking_for") or [],
            "years_experience": f.get("years_experience"),
            "founder_history": f.get("founder_history") or "first_time",
        },
        "venture": {
            "industry": i.get("industries") or [],
            "business_model": i.get("business_model"),
            "time_to_mvp": i.get("time_to_mvp"),
            "funding_philosophy": i.get("funding_philosophy") or "open",
            "idea_stage": i.get("idea_stage") or "exploratory",
        },
        "psychographics": {
            "risk_tolerance": p.get("risk_tolerance"),
            "work_life_balance": p.get("work_life_balance"),
            "decision_style": p.get("decision_style"),
            "conflict_style": p.get("conflict_style"),
            "ultimate_goal": p.get("ultimate_goal"),
            "social_battery": p.get("social_battery"),
        },
        "archetypes": {
            "primary": f.get("archetype_primary") or "Builder",
            "secondary": f.get("archetype_secondary"),
            "confidence": 0.7,
        },
        "llm_summary": None,
    }
