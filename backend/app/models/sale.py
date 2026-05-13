from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(200), nullable=True)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(
        SAEnum("pending", "completed", "cancelled", name="sale_status"),
        default="completed",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    user = relationship("User", foreign_keys=[user_id])


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", foreign_keys=[product_id])
