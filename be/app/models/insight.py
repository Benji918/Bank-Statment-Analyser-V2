from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    statement_id = Column(UUID(as_uuid=True), ForeignKey("statements.id", ondelete="CASCADE"), nullable=False)
    analysis_job_id = Column(UUID(as_uuid=True), ForeignKey("analysis_jobs.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    period = Column(String(7), nullable=True)   # e.g. "2024-03"
    summary = Column(Text, nullable=True)
    data = Column(JSONB, nullable=False)         # full structured insight payload
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    statement = relationship("Statement", back_populates="insights")
    analysis_job = relationship("AnalysisJob", back_populates="insights")
