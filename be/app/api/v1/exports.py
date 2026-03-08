import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.services import insight_service, export_service
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{statement_id}/pdf")
async def export_pdf(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    insight = await insight_service.get_insights_for_statement(db, statement_id)
    if not insight:
        raise NotFoundException("Insight not found")
    if insight.user_id != current_user.id:
        raise ForbiddenException()

    pdf_bytes = export_service.generate_pdf_report(insight.data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=insight_{statement_id}.pdf"},
    )


@router.get("/{statement_id}/excel")
async def export_excel(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    insight = await insight_service.get_insights_for_statement(db, statement_id)
    if not insight:
        raise NotFoundException("Insight not found")
    if insight.user_id != current_user.id:
        raise ForbiddenException()

    excel_bytes = export_service.generate_excel(insight.data)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=insight_{statement_id}.xlsx"},
    )


@router.get("/{statement_id}/json")
async def export_json(
    statement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    insight = await insight_service.get_insights_for_statement(db, statement_id)
    if not insight:
        raise NotFoundException("Insight not found")
    if insight.user_id != current_user.id:
        raise ForbiddenException()

    json_str = export_service.generate_json(insight.data)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=insight_{statement_id}.json"},
    )
