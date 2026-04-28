"""
Generate and ingest N mock founders directly into Supabase.
Usage:
  python scripts/seed_mock_data.py --count 30
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import random
import uuid
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env.local"))

from db.supabase_client import get_supabase

# ── Mock data pools ────────────────────────────────────────────────────────

FIRST_NAMES = ["Alex", "Sofia", "Marc", "Jana", "Luca", "Emma", "Noah", "Mia",
               "David", "Sara", "James", "Laura", "Pablo", "Anna", "Tom", "Clara",
               "Raj", "Nina", "Omar", "Eva", "Leo", "Iris", "Max", "Zoe"]

LAST_NAMES = ["García", "Müller", "Smith", "Rossi", "Chen", "Kumar", "Dupont",
              "Tanaka", "Silva", "Johansson", "Patel", "Martin", "Weber", "Kim",
              "Fernández", "Becker", "Nguyen", "López", "Brown", "Schäfer"]

CITIES = ["Barcelona", "Barcelona", "Barcelona", "Berlin", "London", "Amsterdam",
          "Paris", "Madrid", "Zurich", "Stockholm"]

INDUSTRIES = ["ai", "fintech", "healthtech", "edtech", "climate", "b2b_saas",
              "marketplace", "deeptech", "cybersecurity", "logistics"]

ARCHETYPES = ["Visionary", "Builder", "Hustler", "Operator", "CEO", "Seller",
              "DomainExpert", "Generalist", "ProductDesigner", "Marketer",
              "Engineer", "Hacker"]

SKILLS = ["tech", "sales", "ops", "product", "design", "finance"]

SKILL_TO_ARCHETYPE = {
    "tech": ["Engineer", "Hacker", "Builder"],
    "sales": ["Seller", "Hustler", "CEO"],
    "ops": ["Operator", "Generalist", "CEO"],
    "product": ["ProductDesigner", "Visionary", "Generalist"],
    "design": ["ProductDesigner", "Marketer", "Visionary"],
    "finance": ["Operator", "DomainExpert", "CEO"],
}

VISIONS = [
    "I want to build AI-powered accounting automation for SMEs. The market is massive and nobody has nailed it.",
    "We are building the infrastructure layer for enterprise AI agents. I quit Google 6 months ago to do this full time.",
    "Climate tech marketplace connecting carbon project developers with corporate buyers. Regulation is pushing demand hard.",
    "Next-gen cybersecurity platform using LLMs to detect threats in real time. Current tools are blind to novel attacks.",
    "B2B SaaS for logistics optimization. Supply chains are still run on Excel. The opportunity is enormous.",
    "AI-native legal document automation. Law firms waste 60% of time on repetitive drafting.",
    "Personalised nutrition platform using continuous glucose monitoring data. Healthcare needs to become preventive.",
    "Open banking data layer for Southern Europe. PSD2 created the opportunity, nobody has built the right abstraction.",
    "Developer tools for AI model observability. Every ML team I know has this problem.",
    "Marketplace for industrial spare parts in LATAM. $40B market with zero digital penetration.",
    "Mental health platform for underserved communities. Therapy is inaccessible for 80% of the population.",
    "No-code workflow automation for healthcare providers. They are stuck on fax machines in 2024.",
]

CONCERNS = [
    "Finding someone as committed as I am. I have walked away from a 200k salary for this.",
    "Someone who complements my skills without stepping on my toes. Clear roles from day one.",
    "I tend to over-engineer. I need someone who keeps me focused on shipping.",
    "Sales is my weakness. I need a co-founder who loves talking to customers.",
    "I do not want someone who treats this as a side project. Full commitment only.",
    "Finding a technical person who can build fast without perfect code.",
    "Equity split conversations. I want to align incentives from the start.",
]

IDEAL_COFOUNDERS = [
    "Technical person who can build fast. Async friendly. Data-driven decision maker.",
    "Commercial person with B2B sales experience. Someone who loves being in front of customers.",
    "Operator who can build systems and processes. I am chaotic and need structure.",
    "Product person with deep user empathy. I build things but I need someone to tell me what to build.",
    "Domain expert in healthcare or finance. The regulatory knowledge is the moat.",
    "Growth marketer who understands SEO, paid and content. We need distribution.",
]


def random_profile(i: int) -> tuple[dict, dict]:
    """Returns (founder_row, profile_json) ready to insert."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower()}.{i}@mock.builders"
    city = random.choice(CITIES)
    remote_ok = random.random() > 0.3

    primary_skill = random.choice(SKILLS)
    looking_for = random.sample([s for s in SKILLS if s != primary_skill], k=random.randint(1, 2))

    commitment = random.choices(
        ["full_time", "side_hustle", "planning"],
        weights=[0.6, 0.25, 0.15]
    )[0]

    funding = random.choices(
        ["vc_track", "bootstrapping", "open"],
        weights=[0.5, 0.25, 0.25]
    )[0]

    founder_id = str(uuid.uuid4())

    primary_archetype = random.choice(SKILL_TO_ARCHETYPE[primary_skill])
    remaining = [a for a in ARCHETYPES if a != primary_archetype]
    secondary_archetype = random.choice(remaining)

    profile_json = {
        "founder_id": founder_id,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "logistics": {
            "location": city,
            "remote_ok": remote_ok,
            "commitment": commitment,
            "hours_per_week": random.choice([20, 30, 40, 50, 60]),
            "runway_months": random.choice([3, 6, 9, 12, 18, 24]),
        },
        "role": {
            "primary_skill": primary_skill,
            "looking_for": looking_for,
            "years_experience": random.randint(2, 15),
            "founder_history": random.choices(
                ["first_timer", "serial", "exited"],
                weights=[0.6, 0.3, 0.1]
            )[0],
        },
        "venture": {
            "industry": random.sample(INDUSTRIES, k=random.randint(1, 2)),
            "business_model": random.choice(["b2b", "b2c", "b2b2c", "marketplace"]),
            "time_to_mvp": random.choice(["1m", "3m", "6m", "12m"]),
            "funding_philosophy": funding,
            "idea_stage": random.choice(["committed", "exploratory"]),
        },
        "psychographics": {
            "risk_tolerance": random.randint(4, 10),
            "work_life_balance": random.randint(3, 10),
            "decision_style": random.choice(["consensus", "ceo_led", "data_driven"]),
            "conflict_style": random.choice(["direct", "mediated", "analytical"]),
            "ultimate_goal": random.choices(
                ["unicorn", "lifestyle", "impact"],
                weights=[0.5, 0.25, 0.25]
            )[0],
            "social_battery": random.choice(["introvert", "extrovert", "ambivert"]),
        },
        "archetypes": {
            "primary": primary_archetype,
            "secondary": secondary_archetype,
            "confidence": round(random.uniform(0.65, 0.95), 2),
        },
        "llm_summary": (
            f"{full_name} is a {primary_archetype} with {random.randint(2,15)} years in "
            f"{primary_skill}. "
            f"{random.choice(VISIONS[:6])} "
            f"Looking for: {', '.join(looking_for)}. "
            f"Main concern: {random.choice(CONCERNS)}"
        ),
    }

    founder_row = {
        "id": founder_id,
        "email": email,
        "full_name": full_name,
        "raw_form_json": {
            "idea_vision": random.choice(VISIONS),
            "ideal_cofounder": random.choice(IDEAL_COFOUNDERS),
            "main_concern": random.choice(CONCERNS),
            "background": f"{random.randint(2,15)} years in {primary_skill}",
            "location": city,
            "remote_ok": remote_ok,
            "commitment": commitment,
            "funding_philosophy": funding,
        },
        "status": "profiled",
    }

    return founder_row, profile_json


def seed(count: int) -> None:
    db = get_supabase()
    inserted = 0

    for i in range(count):
        try:
            founder_row, profile_json = random_profile(i)

            # Insert founder
            db.table("founders").insert(founder_row).execute()

            # Insert profile
            db.table("founder_profiles").insert({
                "founder_id": founder_row["id"],
                "profile_json": profile_json,
                "validated": True,
            }).execute()

            inserted += 1
            print(f"  [{inserted}/{count}] {founder_row['full_name']} — "
                  f"{profile_json['role']['primary_skill']} / "
                  f"{profile_json['archetypes']['primary']} / "
                  f"{profile_json['logistics']['commitment']}")

        except Exception as e:
            print(f"  Error on founder {i}: {e}")

    print(f"\nDone. {inserted}/{count} founders seeded.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=30)
    args = parser.parse_args()
    print(f"Seeding {args.count} mock founders...\n")
    seed(args.count)