from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=True)
    lot_number = Column(String(100), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    reason = Column(String(100), nullable=False)
    has_evidence = Column(Boolean, default=False)
    notes = Column(String(500), nullable=True)
    waste_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
