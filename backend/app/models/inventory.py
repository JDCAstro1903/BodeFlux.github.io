from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    lot_number = Column(String(100), nullable=False, index=True)
    expiry_date = Column(Date, nullable=False)
    location = Column(String(100), nullable=False)
    provider = Column(String(200), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    receipt_date = Column(Date, nullable=False)
    status = Column(
        SAEnum("active", "output", "waste", name="inventory_status"),
        default="active",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    movements = relationship("InventoryMovement", back_populates="inventory_item")
    provider_ref = relationship("Provider", foreign_keys=[provider_id])


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    movement_type = Column(
        SAEnum("entry", "output", "waste", name="movement_type"),
        nullable=False,
    )
    quantity = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    destination = Column(String(200), nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="movements")
    user = relationship("User", foreign_keys=[user_id])
