from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class AnalysisRequest(BaseModel):
    ollama_model: Optional[str] = "llama3"
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
