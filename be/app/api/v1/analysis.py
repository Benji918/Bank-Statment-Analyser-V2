import logging
from uuid import UUID
import json
import asyncio

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as aioredis

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.statement import Statement
from app.models.analysis import AnalysisJob
from app.schemas.analysis import AnalysisRequest, AnalysisJobRead, AnalysisResult
from app.core.exceptions import NotFoundException, ForbiddenException
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{statement_id}/run", response_model=AnalysisResult)
async def run_analysis(
    statement_id: UUID,
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit redacted statement to Ollama for analysis."""
    result = await db.execute(select(Statement).where(Statement.id == statement_id))
    statement = result.scalars().first()
    if not statement:
        raise NotFoundException("Statement not found")
    if statement.user_id != current_user.id:
        raise ForbiddenException()

    job = AnalysisJob(
        statement_id=statement_id,
        ollama_model=settings.OLLAMA_MODEL,
        prompt_version=request.prompt_version,
        status="pending",
    )
    db.add(job)
    statement.status = "analysing"
    await db.commit()
    await db.refresh(job)

    from app.tasks.analysis_tasks import run_analysis as celery_analysis
    celery_analysis.delay(str(statement_id), str(job.id), settings.OLLAMA_MODEL)

    return AnalysisResult(job_id=job.id, status=job.status)


@router.get("/{statement_id}/status", response_model=AnalysisJobRead)
async def get_analysis_status(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Statement).where(Statement.id == statement_id))
    statement = result.scalars().first()
    if not statement:
        raise NotFoundException("Statement not found")
    if statement.user_id != current_user.id:
        raise ForbiddenException()

    job_result = await db.execute(
        select(AnalysisJob)
        .where(AnalysisJob.statement_id == statement_id)
        .order_by(AnalysisJob.started_at.desc())
    )
    job = job_result.scalars().first()
    if not job:
        raise NotFoundException("No analysis job found for this statement")
    return job


@router.websocket("/{job_id}/ws")
async def analysis_ws(websocket: WebSocket, job_id: UUID):
    """
    WebSocket endpoint connecting to Redis PubSub to stream task progress to UI.
    No auth dependency here just for simplicity of the prototype (often passed via token in query).
    """
    await websocket.accept()
    # Connect to Redis to listen for "job_{job_id}" channel
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = r.pubsub()
        await pubsub.subscribe(f"job_{job_id}")

        # Send initial connection success
        await websocket.send_json({"progress": 0, "message": "Connected to analysis engine..."})
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
                
                # Close automatically when successful completion is reached
                if data.get("progress") == 100 or str(data.get("message")).startswith("Error:"):
                    break
                    
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from WS for job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
    finally:
        try:
            await pubsub.unsubscribe(f"job_{job_id}")
            await r.aclose()
        except Exception:
            pass
        if not websocket.client_state.name == "DISCONNECTED":
            await websocket.close()

