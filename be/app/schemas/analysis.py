from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.config import settings

class AnalysisRequest(BaseModel):
    ollama_model: Optional[str] = Field(default_factory=lambda: settings.OLLAMA_MODEL)
    prompt_version: Optional[str] = "v1"


class AnalysisJobRead(BaseModel):
    id: UUID
    statement_id: UUID
    ollama_model: str
    prompt_version: Optional[str] = None
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class AnalysisResult(BaseModel):
    job_id: UUID
    status: str
