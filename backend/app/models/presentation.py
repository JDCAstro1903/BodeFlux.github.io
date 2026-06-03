from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class ProductPresentation(Base):
    __tablename__ = "product_presentations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    presentation_name = Column(String(100), nullable=False)
    content_value = Column(Float, nullable=False)
    content_unit = Column(String(50), nullable=False)
    price_override = Column(Float, nullable=True)
    barcode = Column(String(100), nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="presentations")
