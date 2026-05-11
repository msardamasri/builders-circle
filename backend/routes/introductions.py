from __future__ import annotations

import logging
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["introductions"])

# ── Toggle this to True when ready to send real emails ─────────────────────
EMAILS_ENABLED = False


class IntroPayload(BaseModel):
    match_id: str
    dri: str = "DRI"


@router.post("/introductions", status_code=201)
async def create_introduction(payload: IntroPayload) -> dict:
    db = get_supabase()

    # Fetch match + founder info
    match = db.table("matches") \
        .select("id, score, founder_a_id, founder_b_id, recommendation") \
        .eq("id", payload.match_id) \
        .single() \
        .execute()

    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    m = match.data
    founder_a_id = m["founder_a_id"]
    founder_b_id = m["founder_b_id"]

    # Fetch both founders
    founders = db.table("founders") \
        .select("id, full_name, email") \
        .in_("id", [founder_a_id, founder_b_id]) \
        .execute()

    if len(founders.data) < 2:
        raise HTTPException(status_code=404, detail="Founders not found")

    fa = next(f for f in founders.data if f["id"] == founder_a_id)
    fb = next(f for f in founders.data if f["id"] == founder_b_id)

    # Insert introduction record
    intro = db.table("introductions").insert({
        "match_id": payload.match_id,
        "founder_a_id": founder_a_id,
        "founder_b_id": founder_b_id,
    }).execute()

    intro_id = intro.data[0]["id"]

    # Update match status
    db.table("matches").update({
        "status": "intro_sent",
        "dri": payload.dri,
    }).eq("id", payload.match_id).execute()

    # ── Email (disabled until production) ─────────────────────────────────
    if EMAILS_ENABLED:
        _send_intro_email(fa, fb)
    else:
        logger.info(
            f"[EMAIL STUB] Would send intro email:\n"
            f"  To: {fa['full_name']} <{fa['email']}>\n"
            f"  To: {fb['full_name']} <{fb['email']}>\n"
            f"  Match score: {m['score']} ({m['recommendation']})\n"
            f"  Set EMAILS_ENABLED=True to activate"
        )

    logger.info(f"Introduction {intro_id} created — {fa['full_name']} × {fb['full_name']}")
    return {
        "status": "created",
        "introduction_id": intro_id,
        "emails_sent": EMAILS_ENABLED,
        "founders": [
            {"name": fa["full_name"], "email": fa["email"]},
            {"name": fb["full_name"], "email": fb["email"]},
        ],
    }


def _send_intro_email(fa: dict, fb: dict) -> None:
    """Activate by setting EMAILS_ENABLED = True above."""
    import resend
    resend.api_key = os.environ.get("RESEND_API_KEY", "")

    subject = f"Introduction: {fa['full_name']} × {fb['full_name']} | Builders Circle"
    body = f"""Hi {fa['full_name']} and {fb['full_name']},

We think you two should meet.

The b2venture Builders Circle team has identified you as a strong potential co-founder match based on your complementary skills, shared vision, and aligned values.

This is a double opt-in introduction — if you are both interested, simply reply to this email and we will set up a first call.

No pressure. No obligation.

Best,
The b2venture Builders Circle team
"""

    resend.Emails.send({
        "from": "Builders Circle <intros@builders.b2venture.vc>",
        "to": [fa["email"], fb["email"]],
        "subject": subject,
        "text": body,
    })