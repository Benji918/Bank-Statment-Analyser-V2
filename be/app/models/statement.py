from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from app.db.base import Base


class Statement(Base):
    __tablename__ = "statements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    redacted_path = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    bank_name = Column(String(100), nullable=True)
    statement_month = Column(String(7), nullable=True)  # e.g. "2024-03"
    status = Column(String(50), default="uploaded")   # uploaded|redacting|redacted|analysing|done|error
    tags = Column(ARRAY(Text), nullable=True, default=[])
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", backref="statements")
    redaction_jobs = relationship("RedactionJob", back_populates="statement", cascade="all, delete-orphan")
    analysis_jobs = relationship("AnalysisJob", back_populates="statement", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="statement", cascade="all, delete-orphan")
