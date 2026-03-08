import datetime
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.statement import Statement
from app.models.redaction import RedactionJob
from app.schemas.redaction import RedactionJobRead, RedactionResult
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{statement_id}/run", response_model=RedactionResult)
async def run_redaction(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Trigger server-side Presidio redaction pass."""
    result = await db.execute(select(Statement).where(Statement.id == statement_id))
    statement = result.scalars().first()
    if not statement:
        raise NotFoundException("Statement not found")
    if statement.user_id != current_user.id:
        raise ForbiddenException()

    # Create a redaction job record
    job = RedactionJob(statement_id=statement_id, status="pending")
    db.add(job)
    statement.status = "redacting"
    await db.commit()
    await db.refresh(job)

    # Dispatch Celery task
    from app.tasks.redaction_tasks import run_redaction as celery_redaction
    celery_redaction.delay(str(statement_id), str(job.id))

    return RedactionResult(job_id=job.id, status=job.status)


@router.get("/{statement_id}/status", response_model=RedactionJobRead)
async def get_redaction_status(
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
        select(RedactionJob)
        .where(RedactionJob.statement_id == statement_id)
        .order_by(RedactionJob.started_at.desc())
    )
    job = job_result.scalars().first()
    if not job:
        raise NotFoundException("No redaction job found for this statement")
    return job


@router.get("/{statement_id}/report", response_model=RedactionJobRead)
async def get_redaction_report(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get PII detection report for a statement."""
    result = await db.execute(select(Statement).where(Statement.id == statement_id))
    statement = result.scalars().first()
    if not statement:
        raise NotFoundException("Statement not found")
    if statement.user_id != current_user.id:
        raise ForbiddenException()

    job_result = await db.execute(
        select(RedactionJob)
        .where(RedactionJob.statement_id == statement_id, RedactionJob.status == "done")
        .order_by(RedactionJob.completed_at.desc())
    )
    job = job_result.scalars().first()
    if not job:
        raise NotFoundException("No completed redaction report found for this statement")
    return job
