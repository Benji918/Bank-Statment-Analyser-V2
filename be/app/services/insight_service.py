import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.models.insight import Insight
from app.schemas.insight import InsightData, InsightRead, InsightSummary

logger = logging.getLogger(__name__)


async def store_insight(
    db: AsyncSession,
    statement_id: UUID,
    user_id: UUID,
    data: InsightData,
    analysis_job_id: Optional[UUID] = None,
    period: Optional[str] = None,
    summary: Optional[str] = None,
) -> Insight:
    insight = Insight(
        statement_id=statement_id,
        user_id=user_id,
        analysis_job_id=analysis_job_id,
        period=period,
        summary=summary,
        data=data.model_dump(),
    )
    db.add(insight)
    await db.commit()
    await db.refresh(insight)
    return insight


async def get_insights_for_statement(db: AsyncSession, statement_id: UUID) -> Optional[Insight]:
    result = await db.execute(
        select(Insight).where(Insight.statement_id == statement_id).order_by(Insight.created_at.desc())
    )
    return result.scalars().first()


async def list_insights_for_user(db: AsyncSession, user_id: UUID) -> List[Insight]:
    result = await db.execute(
        select(Insight).where(Insight.user_id == user_id).order_by(Insight.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_insight(db: AsyncSession, insight_id: UUID) -> bool:
    result = await db.execute(select(Insight).where(Insight.id == insight_id))
    insight = result.scalars().first()
    if not insight:
        return False
    await db.delete(insight)
    await db.commit()
    return True


async def aggregate_insights(
    db: AsyncSession, user_id: UUID, start_period: Optional[str] = None, end_period: Optional[str] = None
) -> Dict[str, Any]:
    query = select(Insight).where(Insight.user_id == user_id)
    if start_period:
        query = query.where(Insight.period >= start_period)
    if end_period:
        query = query.where(Insight.period <= end_period)

    result = await db.execute(query)
    insights = list(result.scalars().all())

    total_income = sum(i.data.get("total_income", 0) for i in insights)
    total_expenses = sum(i.data.get("total_expenses", 0) for i in insights)
    net_balance = sum(i.data.get("net_balance", 0) for i in insights)

    return {
        "statement_count": len(insights),
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": net_balance,
    }
