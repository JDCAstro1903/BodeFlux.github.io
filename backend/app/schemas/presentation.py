from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PresentationCreate(BaseModel):
    product_id: int
    presentation_name: str
    content_value: float
    content_unit: str
    price_override: Optional[float] = None
    barcode: Optional[str] = None
    is_default: bool = False


class PresentationUpdate(BaseModel):
    presentation_name: Optional[str] = None
    content_value: Optional[float] = None
    content_unit: Optional[str] = None
    price_override: Optional[float] = None
    barcode: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class PresentationResponse(BaseModel):
    id: int
    product_id: int
    presentation_name: str
    content_value: float
    content_unit: str
    price_override: Optional[float] = None
    barcode: Optional[str] = None
    is_default: bool
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
