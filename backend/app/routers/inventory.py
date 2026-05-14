from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from sqlalchemy import func as sqlfunc

from ..database import get_db
from ..models.inventory import InventoryItem, InventoryMovement
from ..models.product import Product as ProductModel
from ..models.user import User
from ..schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryItemUpdate,
    InventoryItemWithAlert,
    LocationStatus,
    OutputRequest,
)
from ..services.inventory_service import get_items_with_alerts, get_occupied_locations
from ..utils.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/", response_model=List[InventoryItemResponse])
def list_inventory(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List inventory items, optionally filtered by status."""
    query = db.query(InventoryItem)
    if status_filter:
        query = query.filter(InventoryItem.status == status_filter)
    else:
        query = query.filter(InventoryItem.status == "active")
    items = query.order_by(InventoryItem.created_at.desc()).all()
    return [InventoryItemResponse.model_validate(i) for i in items]


@router.get("/alerts", response_model=List[InventoryItemWithAlert])
def get_alerts(db: Session = Depends(get_db)):
    """Get all active items with their expiration alert levels."""
    return get_items_with_alerts(db)


@router.get("/locations", response_model=List[LocationStatus])
def get_locations(db: Session = Depends(get_db)):
    """Get occupancy status of all warehouse locations."""
    return get_occupied_locations(db)


@router.get("/product-names", response_model=List[str])
def get_product_names(db: Session = Depends(get_db)):
    """Get all unique product names from inventory items (all statuses)."""
    results = db.query(InventoryItem.product_name).distinct().order_by(InventoryItem.product_name).all()
    return [r[0] for r in results]


@router.get("/{item_id}", response_model=InventoryItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single inventory item by ID."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return InventoryItemResponse.model_validate(item)


def _sync_product_stock(db: Session, product_id: int):
    """Recompute product.stock from all active inventory lots."""
    total = db.query(sqlfunc.sum(InventoryItem.quantity)).filter(
        InventoryItem.product_id == product_id,
        InventoryItem.status == "active",
    ).scalar() or 0.0
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if product:
        product.stock = total
        if total <= 0:
            product.status = "out"
        elif total <= 20:
            product.status = "low"
        else:
            product.status = "available"
        db.commit()


@router.post("/", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    payload: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Register a new inventory entry."""
    # Resolve or create the catalog product
    product: ProductModel | None = None
    if payload.product_id:
        product = db.query(ProductModel).filter(ProductModel.id == payload.product_id).first()
    if not product:
        product = db.query(ProductModel).filter(
            sqlfunc.lower(ProductModel.name) == payload.product_name.lower()
        ).first()
    if not product:
        product = ProductModel(
            name=payload.product_name,
            category=payload.category,
            stock=0,
            price=0,
            unit=payload.unit,
            status="out",
            image_emoji="📦",
        )
        db.add(product)
        db.flush()

    item = InventoryItem(
        product_id=product.id,
        product_name=product.name,
        category=product.category,
        quantity=payload.quantity,
        unit=product.unit,
        lot_number=payload.lot_number,
        expiry_date=payload.expiry_date,
        location=payload.location,
        provider=payload.provider,
        provider_id=payload.provider_id,
        receipt_date=payload.receipt_date,
        status="active",
    )
    db.add(item)
    db.flush()

    movement = InventoryMovement(
        inventory_item_id=item.id,
        movement_type="entry",
        quantity=payload.quantity,
        user_id=current_user.id if current_user else None,
        notes=f"Entrada de {product.name}",
    )
    db.add(movement)
    db.commit()

    _sync_product_stock(db, product.id)
    db.refresh(item)
    return InventoryItemResponse.model_validate(item)


@router.put("/{item_id}", response_model=InventoryItemResponse)
def update_item(
    item_id: int,
    payload: InventoryItemUpdate,
    db: Session = Depends(get_db),
):
    """Update an inventory item."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return InventoryItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an inventory item."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()


@router.post("/{item_id}/output", response_model=InventoryItemResponse)
def register_output(
    item_id: int,
    payload: OutputRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Register an output (salida) for an inventory item."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    if item.status != "active":
        raise HTTPException(status_code=400, detail="El item no está activo")

    if payload.quantity >= item.quantity:
        item.status = "output"
        item.quantity = 0
    else:
        item.quantity -= payload.quantity

    movement = InventoryMovement(
        inventory_item_id=item.id,
        movement_type="output",
        quantity=payload.quantity,
        user_id=current_user.id if current_user else None,
        destination=payload.destination,
        notes=payload.notes or f"Salida a {payload.destination}",
    )
    db.add(movement)
    db.commit()

    if item.product_id:
        _sync_product_stock(db, item.product_id)
    db.refresh(item)
    return InventoryItemResponse.model_validate(item)
