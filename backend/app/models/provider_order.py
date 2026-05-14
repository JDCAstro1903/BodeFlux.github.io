from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ProviderOrder(Base):
    __tablename__ = "provider_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    provider_name = Column(String(200), nullable=True)
    status = Column(
        SAEnum("pending", "sent", "received", "cancelled", name="provider_order_status"),
        default="pending",
        nullable=False,
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship(
        "ProviderOrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class ProviderOrderItem(Base):
    __tablename__ = "provider_order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("provider_orders.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)

    order = relationship("ProviderOrder", back_populates="items")
