import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagRead

logger = logging.getLogger(__name__)


async def create_tag(db: AsyncSession, user_id: UUID, tag_in: TagCreate) -> Tag:
    tag = Tag(user_id=user_id, name=tag_in.name, colour=tag_in.colour)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def list_tags(db: AsyncSession, user_id: UUID) -> List[Tag]:
    result = await db.execute(select(Tag).where(Tag.user_id == user_id).order_by(Tag.name))
    return list(result.scalars().all())


async def delete_tag(db: AsyncSession, tag_id: UUID, user_id: UUID) -> bool:
    result = await db.execute(select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id))
    tag = result.scalars().first()
    if not tag:
        return False
    await db.delete(tag)
    await db.commit()
    return True
