from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from db.supabase_client import get_supabase
from pipeline.ingestion import run_ingestion

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["ingestion"])


class IngestPayload(BaseModel):
    email: str
    full_name: str
    raw_form_json: dict


@router.post("/ingest", status_code=202)
async def ingest_founder(
    payload: IngestPayload,
    background_tasks: BackgroundTasks,
) -> dict:
    db = get_supabase()

    # Insert raw founder row
    try:
        result = db.table("founders").insert({
            "email": payload.email,
            "full_name": payload.full_name,
            "raw_form_json": payload.raw_form_json,
            "status": "received",
        }).execute()
        founder_id = result.data[0]["id"]
    except Exception as e:
        logger.error(f"Failed to insert founder: {e}")
        raise HTTPException(status_code=500, detail="Failed to create founder record")

    # Run pipeline async — response returns immediately
    background_tasks.add_task(run_ingestion, founder_id, payload.raw_form_json)

    logger.info(f"Founder {founder_id} queued for ingestion")
    return {"status": "accepted", "founder_id": founder_id}