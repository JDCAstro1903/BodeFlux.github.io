from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime

VALID_UNITS = {"kg", "L", "caja"}


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

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        if v not in VALID_UNITS:
            raise ValueError(f"Unidad '{v}' no válida. Usa: {', '.join(sorted(VALID_UNITS))}")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("La cantidad debe ser mayor a 0")
        return v


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

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("La cantidad a retirar debe ser mayor a 0")
        return v


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
