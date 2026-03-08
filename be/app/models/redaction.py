from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base


class RedactionJob(Base):
    __tablename__ = "redaction_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    statement_id = Column(UUID(as_uuid=True), ForeignKey("statements.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # pending|running|done|failed
    pii_found = Column(JSONB, nullable=True)         # list of detected PII types + counts
    confidence_avg = Column(Float, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    statement = relationship("Statement", back_populates="redaction_jobs")
