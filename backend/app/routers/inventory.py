from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from sqlalchemy import func as sqlfunc

from ..database import get_db
from ..models.inventory import InventoryItem, InventoryMovement
from ..models.product import Product as ProductModel
from ..models.user import User
from ..models.presentation import ProductPresentation
from ..schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryItemUpdate,
    InventoryItemWithAlert,
    MovementResponse,
    OutputRequest,
)
from ..schemas.warehouse import WarehouseMapCell, WarehouseSummary
from ..services.inventory_service import get_items_with_alerts, get_warehouse_map, get_warehouse_summary
from ..utils.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/", response_model=List[InventoryItemResponse])
def list_inventory(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List inventory items, optionally filtered by status. Pass status=all to return every status."""
    query = db.query(InventoryItem)
    if status_filter and status_filter != 'all':
        query = query.filter(InventoryItem.status == status_filter)
    elif not status_filter:
        query = query.filter(InventoryItem.status == "active")
    # status_filter == 'all' → no filter applied
    items = query.order_by(InventoryItem.created_at.desc()).all()
    return [InventoryItemResponse.model_validate(i) for i in items]


@router.get("/alerts", response_model=List[InventoryItemWithAlert])
def get_alerts(db: Session = Depends(get_db)):
    """Get all active items with their expiration alert levels."""
    return get_items_with_alerts(db)


@router.get("/locations", response_model=List[WarehouseMapCell])
def get_locations(db: Session = Depends(get_db)):
    """Get occupancy status of all warehouse locations."""
    return get_warehouse_map(db)


@router.get("/locations/summary", response_model=WarehouseSummary)
def get_locations_summary(db: Session = Depends(get_db)):
    """Get warehouse summary."""
    return get_warehouse_summary(db)


@router.get("/product-names", response_model=List[str])
def get_product_names(db: Session = Depends(get_db)):
    """Get all unique product names from inventory items (all statuses)."""
    results = db.query(InventoryItem.product_name).distinct().order_by(InventoryItem.product_name).all()
    return [r[0] for r in results]


@router.get("/movements", response_model=List[MovementResponse])
def list_movements(
    movement_type: Optional[str] = Query(None),
    limit: int = Query(200, le=500),
    db: Session = Depends(get_db),
):
    """List inventory movements (entries, outputs, waste)."""
    query = db.query(InventoryMovement)
    if movement_type:
        query = query.filter(InventoryMovement.movement_type == movement_type)
    movements = query.order_by(InventoryMovement.created_at.desc()).limit(limit).all()

    results = []
    for m in movements:
        item = m.inventory_item
        user = m.user
        results.append(MovementResponse(
            id=m.id,
            inventory_item_id=m.inventory_item_id,
            movement_type=m.movement_type,
            quantity=m.quantity,
            user_id=m.user_id,
            destination=m.destination,
            notes=m.notes,
            created_at=m.created_at,
            product_name=item.product_name if item else None,
            unit=item.unit if item else None,
            lot_number=item.lot_number if item else None,
            user_name=user.name if user else None,
        ))
    return results


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

    presentation: ProductPresentation | None = None
    if payload.presentation_id:
        presentation = db.query(ProductPresentation).filter(ProductPresentation.id == payload.presentation_id).first()

    final_quantity = payload.quantity
    if presentation:
        final_quantity = payload.quantity * presentation.content_value

    item = InventoryItem(
        product_id=product.id,
        presentation_id=presentation.id if presentation else None,
        product_name=product.name,
        category=product.category,
        quantity=final_quantity,
        unit=product.unit,
        lot_number=payload.lot_number,
        expiry_date=payload.expiry_date,
        location=payload.location,
        provider=payload.provider,
        provider_id=payload.provider_id,
        receipt_date=payload.receipt_date,
        status="active",
        registered_by_id=current_user.id if current_user else None,
        registered_by_name=current_user.name if current_user else None,
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

    if ("quantity" in update_data or "status" in update_data) and item.product_id:
        _sync_product_stock(db, item.product_id)
        db.refresh(item)

    return InventoryItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an inventory item."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    product_id = item.product_id
    db.delete(item)
    db.commit()
    if product_id:
        _sync_product_stock(db, product_id)


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
