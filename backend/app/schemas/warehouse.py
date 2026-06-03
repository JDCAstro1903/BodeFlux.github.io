from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WarehouseLocationResponse(BaseModel):
    id: int
    code: str
    row_label: str
    col_number: int
    max_capacity: float
    capacity_unit: str
    location_type: str
    is_enabled: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class WarehouseProductInfo(BaseModel):
    product_name: str
    lot_number: str
    quantity: float
    unit: str
    expiry_date: Optional[str] = None
    days_left: Optional[int] = None


class WarehouseMapCell(BaseModel):
    code: str
    row_label: str
    col_number: int
    location_type: str
    is_enabled: bool
    max_capacity: float
    capacity_unit: str
    used_capacity: float
    occupancy_percent: float
    status: str  # empty, available, nearly_full, full
    products: List[WarehouseProductInfo] = []


class WarehouseSummary(BaseModel):
    total_locations: int
    occupied_locations: int
    empty_locations: int
    full_locations: int
    overall_occupancy_percent: float
    alert_level: str  # normal, warning, critical
