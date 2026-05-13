from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProviderCreate(BaseModel):
    name: str
    contact: str
    email: str
    phone: str
    address: str
    category: str


class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[str] = None


class ProviderResponse(BaseModel):
    id: int
    name: str
    contact: str
    email: str
    phone: str
    address: str
    category: str
    rating: float
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
