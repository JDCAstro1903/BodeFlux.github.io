from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from ..database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    contact = Column(String(150), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(String(300), nullable=False)
    category = Column(String(100), nullable=False)
    rating = Column(Float, default=0.0)
    status = Column(
        SAEnum("active", "inactive", name="provider_status"),
        default="active",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
