from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.dashboard import ChartPoint, KPIResponse, TopProduct, TopProvider
from ..services.dashboard_service import (
    get_category_chart,
    get_kpis,
    get_movement_chart,
    get_revenue_chart,
    get_stock_chart,
    get_top_products,
    get_top_providers,
    get_waste_chart,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=KPIResponse)
def dashboard_kpis(db: Session = Depends(get_db)):
    """Get all KPIs for the executive dashboard."""
    return get_kpis(db)


@router.get("/charts/stock", response_model=List[ChartPoint])
def chart_stock(db: Session = Depends(get_db)):
    """Get stock level chart data."""
    return get_stock_chart(db)


@router.get("/charts/categories", response_model=List[ChartPoint])
def chart_categories(db: Session = Depends(get_db)):
    """Get category distribution chart data."""
    return get_category_chart(db)


@router.get("/charts/revenue", response_model=List[ChartPoint])
def chart_revenue(db: Session = Depends(get_db)):
    """Get revenue vs expenses chart data."""
    return get_revenue_chart(db)


@router.get("/charts/movements", response_model=List[ChartPoint])
def chart_movements(db: Session = Depends(get_db)):
    """Get weekly movements chart data."""
    return get_movement_chart(db)


@router.get("/top-products", response_model=List[TopProduct])
def top_products(db: Session = Depends(get_db)):
    """Get top 5 best-selling products."""
    return get_top_products(db)


@router.get("/top-providers", response_model=List[TopProvider])
def top_providers(db: Session = Depends(get_db)):
    """Get top-rated providers."""
    return get_top_providers(db)


@router.get("/charts/waste", response_model=List[ChartPoint])
def chart_waste(db: Session = Depends(get_db)):
    """Get waste quantity and count per month for the last 6 months."""
    return get_waste_chart(db)
