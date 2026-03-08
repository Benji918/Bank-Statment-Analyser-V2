from sqlalchemy import Column, String, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    colour = Column(String(7), nullable=True)   # hex colour e.g. #3B82F6

    __table_args__ = (UniqueConstraint("user_id", "name", name="uix_tag_user_name"),)

    user = relationship("User", backref="tags")
