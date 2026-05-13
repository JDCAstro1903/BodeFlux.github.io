from datetime import date, timedelta
from typing import List

from sqlalchemy.orm import Session

from ..models.inventory import InventoryItem
from ..schemas.inventory import InventoryItemWithAlert


def get_days_left(expiry_date: date) -> int:
    """Calculate days until expiry."""
    today = date.today()
    return (expiry_date - today).days


def get_alert_level(days_left: int) -> str:
    """Determine alert level based on days to expiry."""
    if days_left < 0:
        return "expired"
    if days_left <= 15:
        return "critical"
    if days_left <= 30:
        return "warning"
    return "healthy"


def get_items_with_alerts(db: Session) -> List[InventoryItemWithAlert]:
    """Get all active inventory items with their alert levels."""
    items = (
        db.query(InventoryItem)
        .filter(InventoryItem.status == "active")
        .all()
    )

    result = []
    for item in items:
        days_left = get_days_left(item.expiry_date)
        alert_level = get_alert_level(days_left)
        item_dict = {
            "id": item.id,
            "product_name": item.product_name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "lot_number": item.lot_number,
            "expiry_date": item.expiry_date,
            "location": item.location,
            "provider": item.provider,
            "provider_id": item.provider_id,
            "receipt_date": item.receipt_date,
            "status": item.status,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "days_left": days_left,
            "alert_level": alert_level,
        }
        result.append(InventoryItemWithAlert(**item_dict))

    return result


def get_occupied_locations(db: Session) -> List[dict]:
    """Get the occupancy status of all warehouse locations."""
    all_locations = [
        f"{row}-{col}" for row in ["A", "B", "C"] for col in ["1", "2", "3"]
    ]

    active_items = (
        db.query(InventoryItem)
        .filter(InventoryItem.status == "active")
        .all()
    )

    occupied = {}
    for item in active_items:
        # Extract grid location from "Pasillo X-Y" format
        loc = item.location
        if loc:
            import re
            match = re.search(r"([A-C]-[1-3])", loc)
            if match:
                key = match.group(1)
                occupied[key] = {
                    "product_name": item.product_name,
                    "lot_number": item.lot_number,
                }

    result = []
    for loc in all_locations:
        if loc in occupied:
            result.append({
                "location": loc,
                "is_occupied": True,
                "product_name": occupied[loc]["product_name"],
                "lot_number": occupied[loc]["lot_number"],
            })
        else:
            result.append({
                "location": loc,
                "is_occupied": False,
                "product_name": None,
                "lot_number": None,
            })

    return result
