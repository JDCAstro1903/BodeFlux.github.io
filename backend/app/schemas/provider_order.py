from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ProviderOrderItemCreate(BaseModel):
    product_name: str
    quantity: float
    unit: str


class ProviderOrderItemResponse(ProviderOrderItemCreate):
    id: int
    order_id: int

    model_config = {"from_attributes": True}


class ProviderOrderCreate(BaseModel):
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None
    notes: Optional[str] = None
    items: List[ProviderOrderItemCreate]


class ProviderOrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class ProviderOrderResponse(BaseModel):
    id: int
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[ProviderOrderItemResponse] = []

    model_config = {"from_attributes": True}
