from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict


class RedactionJobRead(BaseModel):
    id: UUID
    statement_id: UUID
    status: str
    pii_found: Optional[Dict[str, Any]] = None
    confidence_avg: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class RedactionResult(BaseModel):
    job_id: UUID
    status: str
    pii_found: Optional[Dict[str, Any]] = None
    confidence_avg: Optional[float] = None
