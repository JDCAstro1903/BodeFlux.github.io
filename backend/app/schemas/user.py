from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    employee_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ---------- User ----------
class UserCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str
    role: str  # warehouse | sales | executive


class UserResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Fix forward reference
TokenResponse.model_rebuild()
