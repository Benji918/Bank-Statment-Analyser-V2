from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class TagCreate(BaseModel):
    name: str
    colour: Optional[str] = None


class TagRead(BaseModel):
    id: UUID
    name: str
    colour: Optional[str] = None

    class Config:
        from_attributes = True
