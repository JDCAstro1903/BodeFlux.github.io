from pydantic import BaseModel
from typing import List, Optional


class KPIResponse(BaseModel):
    inventory_value: str
    inventory_delta: str
    avoided_waste: str
    avoided_waste_delta: str
    avg_response_time: str
    avg_response_delta: str
    active_products: int
    movements_today: int
    active_users: int
    rotation_rate: str
    rotation_delta: str
    fulfillment: str
    fulfillment_delta: str
    response_time: str
    response_delta: str
    stock_accuracy: str
    stock_delta: str
    profit_margin: str
    profit_margin_delta: str
    waste_this_month: int


class ChartPoint(BaseModel):
    label: str
    value: float
    value2: Optional[float] = None


class TopProduct(BaseModel):
    name: str
    sales: int
    revenue: float


class TopProvider(BaseModel):
    name: str
    rating: float
    orders: int
    on_time: float
