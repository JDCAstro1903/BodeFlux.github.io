from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class WasteCreate(BaseModel):
    inventory_item_id: Optional[int] = None
    lot_number: str
    product_name: str
    quantity: float
    unit: str
    reason: str
    has_evidence: bool = False
    notes: Optional[str] = None
    waste_date: date


class WasteResponse(BaseModel):
    id: int
    inventory_item_id: Optional[int] = None
    lot_number: str
    product_name: str
    quantity: float
    unit: str
    reason: str
    has_evidence: bool
    notes: Optional[str] = None
    waste_date: date
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
