from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.inventory import InventoryItem, InventoryMovement
from ..models.product import Product
from ..models.sale import Sale, SaleItem
from ..models.user import User
from ..schemas.sale import SaleCreate, SaleResponse
from ..utils.security import get_optional_user

router = APIRouter(prefix="/api/sales", tags=["Sales"])

TAX_RATE = 0.16  # 16% IVA


@router.get("/", response_model=List[SaleResponse])
def list_sales(db: Session = Depends(get_db)):
    """List all sales."""
    sales = db.query(Sale).order_by(Sale.created_at.desc()).all()
    return [SaleResponse.model_validate(s) for s in sales]


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """Get a single sale with its items."""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return SaleResponse.model_validate(sale)


@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """Create a new sale (checkout)."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # Calculate totals and validate stock
    subtotal = 0.0
    sale_items = []

    for item_data in payload.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item_data.product_id} no encontrado",
            )
        if product.stock < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {product.name}",
            )

        # Calculate item discount
        item_discount = 0.0
        if item_data.discount_type == 'percentage':
            item_discount = (item_data.unit_price * item_data.discount_value / 100) * item_data.quantity
        elif item_data.discount_type == 'fixed':
            item_discount = item_data.discount_value * item_data.quantity

        final_unit_price = item_data.unit_price - (item_discount / item_data.quantity if item_data.quantity > 0 else 0)
        total_price = item_data.quantity * final_unit_price
        subtotal += total_price

        sale_items.append(
            SaleItem(
                product_id=item_data.product_id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                original_price=item_data.unit_price,
                discount_type=item_data.discount_type,
                discount_value=item_data.discount_value,
                unit_price=final_unit_price,
                total_price=total_price,
            )
        )

        # Deduct stock from product and inventory items (FEFO by expiry date)
        product.stock -= item_data.quantity
        if product.stock <= 0:
            product.status = "out"
        elif product.stock <= 20:
            product.status = "low"

        remaining = item_data.quantity
        lots = (
            db.query(InventoryItem)
            .filter(
                InventoryItem.product_id == item_data.product_id,
                InventoryItem.status == "active",
            )
            .order_by(InventoryItem.expiry_date.asc())
            .all()
        )
        for lot in lots:
            if remaining <= 0:
                break
            deducted = 0
            if lot.quantity <= remaining:
                deducted = lot.quantity
                remaining -= lot.quantity
                lot.quantity = 0
                lot.status = "output"
            else:
                deducted = remaining
                lot.quantity -= remaining
                remaining = 0
                
            if deducted > 0:
                movement = InventoryMovement(
                    inventory_item_id=lot.id,
                    movement_type="output",
                    quantity=deducted,
                    user_id=current_user.id if current_user else None,
                    notes=f"Venta a {payload.customer_name or 'Público General'}"
                )
                db.add(movement)

    # Sale level discount
    sale_discount = 0.0
    if payload.discount_type == 'percentage':
        sale_discount = subtotal * payload.discount_value / 100
    elif payload.discount_type == 'fixed':
        sale_discount = payload.discount_value

    subtotal_after_discount = max(0.0, subtotal - sale_discount)
    tax = subtotal_after_discount * TAX_RATE
    total = subtotal_after_discount + tax

    sale = Sale(
        user_id=current_user.id if current_user else None,
        customer_name=payload.customer_name,
        subtotal=round(subtotal, 2),
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        discount_amount=round(sale_discount, 2),
        tax=round(tax, 2),
        total=round(total, 2),
        status="completed",
    )
    sale.items = sale_items

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return SaleResponse.model_validate(sale)
