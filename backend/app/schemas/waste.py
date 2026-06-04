from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime

VALID_UNITS = {"kg", "L", "caja"}


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
            raise ValueError("La cantidad de merma debe ser mayor a 0")
        return v


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
