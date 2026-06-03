from datetime import date, timedelta
from typing import List

from sqlalchemy.orm import Session

from ..models.inventory import InventoryItem
from ..models.warehouse import WarehouseLocation
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


def get_warehouse_map(db: Session) -> List[dict]:
    locations = db.query(WarehouseLocation).all()
    active_items = db.query(InventoryItem).filter(InventoryItem.status == "active").all()
    
    result = []
    for loc in locations:
        used_capacity = 0.0
        products_info = []
        
        for item in active_items:
            # Match by location code
            if loc.code in item.location:
                used_capacity += item.quantity
                days_left = get_days_left(item.expiry_date)
                products_info.append({
                    "product_name": item.product_name,
                    "lot_number": item.lot_number,
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "expiry_date": item.expiry_date.isoformat(),
                    "days_left": days_left
                })
                
        occupancy_percent = 0.0
        if loc.max_capacity > 0:
            occupancy_percent = (used_capacity / loc.max_capacity) * 100
            
        if occupancy_percent == 0:
            status = "empty"
        elif occupancy_percent < 80:
            status = "available"
        elif occupancy_percent < 100:
            status = "nearly_full"
        else:
            status = "full"
            
        result.append({
            "code": loc.code,
            "row_label": loc.row_label,
            "col_number": loc.col_number,
            "location_type": loc.location_type,
            "is_enabled": loc.is_enabled,
            "max_capacity": loc.max_capacity,
            "capacity_unit": loc.capacity_unit,
            "used_capacity": used_capacity,
            "occupancy_percent": occupancy_percent,
            "status": status,
            "products": products_info
        })
        
    return result

def get_warehouse_summary(db: Session) -> dict:
    cells = get_warehouse_map(db)
    total_locations = len(cells)
    if total_locations == 0:
        return {
            "total_locations": 0,
            "occupied_locations": 0,
            "empty_locations": 0,
            "full_locations": 0,
            "overall_occupancy_percent": 0.0,
            "alert_level": "normal"
        }
        
    empty = sum(1 for c in cells if c["status"] == "empty")
    full = sum(1 for c in cells if c["status"] == "full")
    occupied = total_locations - empty
    
    total_max = sum(c["max_capacity"] for c in cells)
    total_used = sum(c["used_capacity"] for c in cells)
    
    overall = (total_used / total_max * 100) if total_max > 0 else 0.0
    
    alert_level = "normal"
    if overall > 90:
        alert_level = "critical"
    elif overall > 75:
        alert_level = "warning"
        
    return {
        "total_locations": total_locations,
        "occupied_locations": occupied,
        "empty_locations": empty,
        "full_locations": full,
        "overall_occupancy_percent": overall,
        "alert_level": alert_level
    }
