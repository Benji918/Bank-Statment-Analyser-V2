import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

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
