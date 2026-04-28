from __future__ import annotations
from pydantic import BaseModel
from typing import Literal
from uuid import UUID
from datetime import datetime


class MatchThesis(BaseModel):
    match_thesis: str
    main_concern: str | None = None
    recommendation: Literal["strong", "moderate", "weak"]


class Match(BaseModel):
    id: UUID
    founder_a_id: UUID
    founder_b_id: UUID
    score: float
    recommendation: Literal["strong", "moderate", "weak"] | None = None
    match_thesis: str | None = None
    main_concern: str | None = None
    status: Literal["pending_review", "approved", "rejected", "intro_sent"] = "pending_review"
    dri: str | None = None
    event_id: UUID | None = None
    created_at: datetime
    reviewed_at: datetime | None = None


class MatchStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
    dri: str