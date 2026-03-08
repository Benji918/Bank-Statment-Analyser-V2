import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.insight import Insight
from app.schemas.insight import InsightRead, InsightSummary
from app.services import insight_service
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[InsightSummary])
async def list_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all insight summaries for the current user."""
    return await insight_service.list_insights_for_user(db, current_user.id)


@router.get("/aggregate")
async def aggregate_insights(
    start_period: Optional[str] = Query(None, description="Start period e.g. 2024-01"),
    end_period: Optional[str] = Query(None, description="End period e.g. 2024-12"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Aggregate insights across multiple statements for the current user."""
    return await insight_service.aggregate_insights(db, current_user.id, start_period, end_period)


@router.get("/{statement_id}", response_model=InsightRead)
async def get_insight(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get full insight JSON for a statement."""
    insight = await insight_service.get_insights_for_statement(db, statement_id)
    if not insight:
        raise NotFoundException("Insight not found for this statement")
    if insight.user_id != current_user.id:
        raise ForbiddenException()
    return insight


@router.delete("/{insight_id}", status_code=204)
async def delete_insight(
    insight_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Insight).where(Insight.id == insight_id))
    insight = result.scalars().first()
    if not insight:
        raise NotFoundException("Insight not found")
    if insight.user_id != current_user.id:
        raise ForbiddenException()
    deleted = await insight_service.delete_insight(db, insight_id)
    if not deleted:
        raise NotFoundException("Insight not found")
