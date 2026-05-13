from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    category: str
    stock: float = 0
    price: float
    unit: str
    image_emoji: Optional[str] = "📦"


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[float] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    image_emoji: Optional[str] = None


class StockUpdate(BaseModel):
    stock: float


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    stock: float
    price: float
    unit: str
    status: str
    image_emoji: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
