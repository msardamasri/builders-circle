from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID
from datetime import datetime


# --- Sub-models ---

class Logistics(BaseModel):
    location: str
    remote_ok: bool
    commitment: Literal["full_time", "side_hustle", "planning"]
    hours_per_week: int | None = None
    runway_months: int | None = None


class Role(BaseModel):
    primary_skill: Literal["tech", "sales", "ops", "product", "design", "finance"]
    looking_for: list[str]
    years_experience: int | None = None
    founder_history: Literal["first_timer", "serial", "exited"]


class Venture(BaseModel):
    industry: list[str]
    business_model: Literal["b2b", "b2c", "b2b2c", "marketplace"]
    time_to_mvp: Literal["1m", "3m", "6m", "12m"]
    funding_philosophy: Literal["vc_track", "bootstrapping", "open"]
    idea_stage: Literal["committed", "exploratory"]


class Psychographics(BaseModel):
    risk_tolerance: int = Field(ge=1, le=10)
    work_life_balance: int = Field(ge=1, le=10)
    decision_style: Literal["consensus", "ceo_led", "data_driven"]
    conflict_style: Literal["direct", "mediated", "analytical"]
    ultimate_goal: Literal["unicorn", "lifestyle", "impact"]
    social_battery: Literal["introvert", "extrovert", "ambivert"]


ArchetypeEnum = Literal[
    "Visionary", "Builder", "Hustler", "Operator", "CEO",
    "Seller", "DomainExpert", "Generalist", "ProductDesigner",
    "Marketer", "Engineer", "Hacker"
]


class Archetypes(BaseModel):
    primary: ArchetypeEnum
    secondary: ArchetypeEnum | None = None
    confidence: float = Field(ge=0.0, le=1.0)


# --- Main profile model ---

class FounderProfile(BaseModel):
    founder_id: UUID
    processed_at: datetime
    logistics: Logistics
    role: Role
    venture: Venture
    psychographics: Psychographics
    archetypes: Archetypes
    llm_summary: str


# --- Raw form input ---

class FounderFormInput(BaseModel):
    email: str
    full_name: str
    raw_form_json: dict