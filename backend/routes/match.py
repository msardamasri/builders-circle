from __future__ import annotations

import logging
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from pipeline.matching import run_matching

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["matching"])


class MatchRequest(BaseModel):
    event_id: str | None = None
    dry_run: bool = False


@router.post("/match", status_code=202)
async def trigger_matching(
    payload: MatchRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    if payload.dry_run:
        # Run synchronously and return results for preview
        results = run_matching(event_id=payload.event_id)
        return {"status": "dry_run", "matches_found": len(results), "matches": results}

    background_tasks.add_task(run_matching, payload.event_id)
    return {"status": "accepted", "message": "Matching run started in background"}