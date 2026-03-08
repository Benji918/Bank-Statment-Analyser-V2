from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class StatementBase(BaseModel):
    filename: str
    bank_name: Optional[str] = None
    statement_month: Optional[str] = None
    tags: Optional[List[str]] = []


class StatementUpload(StatementBase):
    pass


class StatementUpdate(BaseModel):
    tags: Optional[List[str]] = None
    bank_name: Optional[str] = None
    statement_month: Optional[str] = None


class StatementRead(StatementBase):
    id: UUID
    user_id: UUID
    file_size_bytes: Optional[int] = None
    status: str
    uploaded_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
