from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.inventory import InventoryItem, InventoryMovement
from ..models.user import User
from ..models.waste import WasteRecord
from ..schemas.waste import WasteCreate, WasteResponse
from ..utils.security import get_optional_user

router = APIRouter(prefix="/api/waste", tags=["Waste"])


@router.get("/", response_model=List[WasteResponse])
def list_waste(db: Session = Depends(get_db)):
    """List all waste records."""
    records = db.query(WasteRecord).order_by(WasteRecord.created_at.desc()).all()
    return [WasteResponse.model_validate(r) for r in records]


@router.post("/", response_model=WasteResponse, status_code=status.HTTP_201_CREATED)
def create_waste(
    payload: WasteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """Register a waste (merma) record."""
    # If linked to an inventory item, mark it as waste
    if payload.inventory_item_id:
        item = (
            db.query(InventoryItem)
            .filter(InventoryItem.id == payload.inventory_item_id)
            .first()
        )
        if item and item.status == "active":
            item.status = "waste"
            movement = InventoryMovement(
                inventory_item_id=item.id,
                movement_type="waste",
                quantity=payload.quantity,
                user_id=current_user.id if current_user else None,
                notes=f"Merma: {payload.reason}",
            )
            db.add(movement)
    else:
        # Try to find matching item by lot number
        item = (
            db.query(InventoryItem)
            .filter(
                InventoryItem.lot_number == payload.lot_number,
                InventoryItem.status == "active",
            )
            .first()
        )
        if item:
            item.status = "waste"
            movement = InventoryMovement(
                inventory_item_id=item.id,
                movement_type="waste",
                quantity=payload.quantity,
                user_id=current_user.id if current_user else None,
                notes=f"Merma: {payload.reason}",
            )
            db.add(movement)

    record = WasteRecord(
        inventory_item_id=payload.inventory_item_id or (item.id if item else None),
        lot_number=payload.lot_number,
        product_name=payload.product_name,
        quantity=payload.quantity,
        unit=payload.unit,
        reason=payload.reason,
        has_evidence=payload.has_evidence,
        notes=payload.notes,
        waste_date=payload.waste_date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return WasteResponse.model_validate(record)
