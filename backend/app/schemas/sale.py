from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SaleItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: float
    unit_price: float
    discount_type: Optional[str] = None
    discount_value: float = 0.0


class SaleCreate(BaseModel):
    customer_name: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: float = 0.0
    items: List[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: float
    original_price: float = 0.0
    discount_type: Optional[str] = None
    discount_value: float = 0.0
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    customer_name: Optional[str] = None
    subtotal: float
    discount_type: Optional[str] = None
    discount_value: float = 0.0
    discount_amount: float = 0.0
    tax: float
    total: float
    status: str
    items: List[SaleItemResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
