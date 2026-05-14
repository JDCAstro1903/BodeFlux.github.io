from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.provider_order import ProviderOrder, ProviderOrderItem
from ..models.provider import Provider
from ..schemas.provider_order import (
    ProviderOrderCreate,
    ProviderOrderResponse,
    ProviderOrderUpdate,
)

router = APIRouter(prefix="/api/provider-orders", tags=["Provider Orders"])


@router.get("/", response_model=List[ProviderOrderResponse])
def list_orders(db: Session = Depends(get_db)):
    """List all provider orders."""
    orders = db.query(ProviderOrder).order_by(ProviderOrder.created_at.desc()).all()
    return [ProviderOrderResponse.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=ProviderOrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a single provider order."""
    order = db.query(ProviderOrder).filter(ProviderOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return ProviderOrderResponse.model_validate(order)


@router.post("/", response_model=ProviderOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: ProviderOrderCreate, db: Session = Depends(get_db)):
    """Create a new provider order."""
    provider_name = payload.provider_name
    if payload.provider_id and not provider_name:
        provider = db.query(Provider).filter(Provider.id == payload.provider_id).first()
        if provider:
            provider_name = provider.name

    order = ProviderOrder(
        provider_id=payload.provider_id,
        provider_name=provider_name,
        status="pending",
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    for item_data in payload.items:
        item = ProviderOrderItem(
            order_id=order.id,
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            unit=item_data.unit,
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return ProviderOrderResponse.model_validate(order)


@router.put("/{order_id}", response_model=ProviderOrderResponse)
def update_order(order_id: int, payload: ProviderOrderUpdate, db: Session = Depends(get_db)):
    """Update status or notes of a provider order."""
    order = db.query(ProviderOrder).filter(ProviderOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)
    return ProviderOrderResponse.model_validate(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete a provider order."""
    order = db.query(ProviderOrder).filter(ProviderOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    db.delete(order)
    db.commit()
