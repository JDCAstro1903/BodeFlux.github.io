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

        total_price = item_data.quantity * item_data.unit_price
        subtotal += total_price

        sale_items.append(
            SaleItem(
                product_id=item_data.product_id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=total_price,
            )
        )

        # Deduct stock from product and inventory items (FIFO by expiry date)
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
            if lot.quantity <= remaining:
                remaining -= lot.quantity
                lot.quantity = 0
                lot.status = "output"
            else:
                lot.quantity -= remaining
                remaining = 0

    tax = subtotal * TAX_RATE
    total = subtotal + tax

    sale = Sale(
        user_id=current_user.id if current_user else None,
        customer_name=payload.customer_name,
        subtotal=round(subtotal, 2),
        tax=round(tax, 2),
        total=round(total, 2),
        status="completed",
    )
    sale.items = sale_items

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return SaleResponse.model_validate(sale)
