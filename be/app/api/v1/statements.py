import os
import shutil
import logging
from typing import List, Optional
from uuid import UUID, uuid4
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.statement import Statement
from app.schemas.statement import StatementRead, StatementUpdate
from app.config import settings
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
logger = logging.getLogger(__name__)

PDF_MAGIC = b"%PDF"
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/", response_model=StatementRead, status_code=status.HTTP_201_CREATED)
async def upload_statement(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Validate PDF magic bytes
    if not contents[:4] == PDF_MAGIC:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are accepted.")

    # Save to filesystem
    storage_path = Path(settings.FILE_STORAGE_PATH) / str(current_user.id)
    storage_path.mkdir(parents=True, exist_ok=True)
    file_id = uuid4()
    file_path = storage_path / f"{file_id}.pdf"
    with open(file_path, "wb") as f:
        f.write(contents)

    # Record in DB
    statement = Statement(
        user_id=current_user.id,
        filename=file.filename or f"{file_id}.pdf",
        file_path=str(file_path),
        file_size_bytes=len(contents),
        status="uploaded",
    )
    db.add(statement)
    await db.commit()
    await db.refresh(statement)
    return statement


@router.get("/", response_model=List[StatementRead])
async def list_statements(
    tag: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Statement).where(Statement.user_id == current_user.id)
    if tag:
        query = query.where(Statement.tags.contains([tag]))
    if status:
        query = query.where(Statement.status == status)
    result = await db.execute(query.order_by(Statement.uploaded_at.desc()))
    return list(result.scalars().all())


@router.get("/{statement_id}", response_model=StatementRead)
async def get_statement(
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
    return statement


@router.patch("/{statement_id}", response_model=StatementRead)
async def update_statement(
    statement_id: UUID,
    update_in: StatementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Statement).where(Statement.id == statement_id))
    statement = result.scalars().first()
    if not statement:
        raise NotFoundException("Statement not found")
    if statement.user_id != current_user.id:
        raise ForbiddenException()

    if update_in.tags is not None:
        statement.tags = update_in.tags
    if update_in.bank_name is not None:
        statement.bank_name = update_in.bank_name
    if update_in.statement_month is not None:
        statement.statement_month = update_in.statement_month

    await db.commit()
    await db.refresh(statement)
    return statement


@router.delete("/{statement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_statement(
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

    # Remove files
    for path in [statement.file_path, statement.redacted_path]:
        if path and os.path.exists(path):
            os.remove(path)

    await db.delete(statement)
    await db.commit()


@router.get("/{statement_id}/download")
async def download_statement(
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
    if not os.path.exists(statement.file_path):
        raise NotFoundException("File not found on disk")
    return FileResponse(statement.file_path, media_type="application/pdf", filename=statement.filename)


@router.get("/{statement_id}/redacted")
async def download_redacted(
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
    if not statement.redacted_path or not os.path.exists(statement.redacted_path):
        raise NotFoundException("Redacted file not available yet")
    return FileResponse(
        statement.redacted_path,
        media_type="application/pdf",
        filename=f"redacted_{statement.filename}",
    )
