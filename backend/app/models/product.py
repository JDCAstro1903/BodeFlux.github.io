from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    stock = Column(Float, default=0)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    status = Column(
        SAEnum("available", "low", "out", name="product_status"),
        default="available",
    )
    image_emoji = Column(String(10), default="📦")
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    provider_name = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
