from pydantic import BaseModel, EmailStr, field_validator
from uuid import UUID
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_strength_validator(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>+=\[\]\\-_/]', v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserRead(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
