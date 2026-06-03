from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum as SAEnum
from sqlalchemy.sql import func
from ..database import Base

class WarehouseLocation(Base):
    __tablename__ = "warehouse_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(10), nullable=False, unique=True, index=True)
    row_label = Column(String(1), nullable=False)
    col_number = Column(Integer, nullable=False)
    max_capacity = Column(Float, nullable=False, default=100)
    capacity_unit = Column(String(20), nullable=False, default="unidades")
    location_type = Column(
        SAEnum("rack", "piso", "refrigerado", "exterior", name="location_type"),
        default="rack",
    )
    is_enabled = Column(Boolean, default=True)
    notes = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
