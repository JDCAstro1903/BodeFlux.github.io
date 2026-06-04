from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class InventoryItemCreate(BaseModel):
    product_id: Optional[int] = None
    presentation_name: Optional[str] = None
    presentation_value: Optional[float] = None
    product_name: str
    category: str
    quantity: float
    unit: str
    lot_number: str
    expiry_date: date
    location: str
    provider: Optional[str] = None
    provider_id: Optional[int] = None
    receipt_date: date


class InventoryItemUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class InventoryItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    presentation_id: Optional[int] = None
    product_name: str
    category: str
    quantity: float
    unit: str
    lot_number: str
    expiry_date: date
    location: str
    provider: Optional[str] = None
    provider_id: Optional[int] = None
    receipt_date: date
    status: str
    registered_by_id: Optional[int] = None
    registered_by_name: Optional[str] = None
    presentation_name: Optional[str] = None
    presentation_value: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InventoryItemWithAlert(InventoryItemResponse):
    days_left: int
    alert_level: str  # critical | warning | healthy | expired


class OutputRequest(BaseModel):
    quantity: float
    destination: str
    lot_number: Optional[str] = None
    notes: Optional[str] = None


class LocationStatus(BaseModel):
    location: str
    is_occupied: bool
    product_name: Optional[str] = None
    lot_number: Optional[str] = None


class MovementResponse(BaseModel):
    id: int
    inventory_item_id: int
    movement_type: str
    quantity: float
    user_id: Optional[int] = None
    destination: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    product_name: Optional[str] = None
    unit: Optional[str] = None
    lot_number: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
