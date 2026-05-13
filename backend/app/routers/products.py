from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.product import Product
from ..schemas.product import ProductCreate, ProductResponse, ProductUpdate, StockUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])


def _update_product_status(product: Product):
    """Auto-update product status based on stock levels."""
    if product.stock <= 0:
        product.status = "out"
    elif product.stock <= 20:
        product.status = "low"
    else:
        product.status = "available"


@router.get("/", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List products with optional filters."""
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") | Product.category.ilike(f"%{search}%")
        )
    products = query.order_by(Product.created_at.desc()).all()
    return [ProductResponse.model_validate(p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return ProductResponse.model_validate(product)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    product = Product(
        name=payload.name,
        category=payload.category,
        stock=payload.stock,
        price=payload.price,
        unit=payload.unit,
        image_emoji=payload.image_emoji or "📦",
    )
    _update_product_status(product)
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Update a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    _update_product_status(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_stock(
    product_id: int,
    payload: StockUpdate,
    db: Session = Depends(get_db),
):
    """Update only the stock of a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    product.stock = payload.stock
    _update_product_status(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)
