from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PresentationInProduct(BaseModel):
    id: int
    presentation_name: str
    content_value: float
    content_unit: str
    price_override: Optional[float] = None
    is_default: bool
    is_active: bool

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    category: str
    stock: float = 0
    price: float
    unit: str
    image_emoji: Optional[str] = "📦"
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[float] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    image_emoji: Optional[str] = None
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None


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
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None
    created_at: Optional[datetime] = None
    presentations: List[PresentationInProduct] = []

    class Config:
        from_attributes = True
