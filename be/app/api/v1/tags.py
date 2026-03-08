import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.tag import TagCreate, TagRead
from app.services import tag_service
from app.core.exceptions import NotFoundException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[TagRead])
async def list_tags(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await tag_service.list_tags(db, current_user.id)


@router.post("/", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_in: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await tag_service.create_tag(db, current_user.id, tag_in)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    deleted = await tag_service.delete_tag(db, tag_id, current_user.id)
    if not deleted:
        raise NotFoundException("Tag not found")
