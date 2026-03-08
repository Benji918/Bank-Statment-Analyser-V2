from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    statement_id = Column(UUID(as_uuid=True), ForeignKey("statements.id", ondelete="CASCADE"), nullable=False)
    ollama_model = Column(String(100), default="llama3")
    prompt_version = Column(String(20), nullable=True)
    status = Column(String(50), default="pending")  # pending|running|done|failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    raw_llm_output = Column(Text, nullable=True)    # stored for debugging

    statement = relationship("Statement", back_populates="analysis_jobs")
    insights = relationship("Insight", back_populates="analysis_job")
