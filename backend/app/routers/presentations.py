from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.presentation import ProductPresentation
from ..models.product import Product
from ..schemas.presentation import PresentationCreate, PresentationUpdate, PresentationResponse

router = APIRouter(prefix="/presentations", tags=["Presentations"])

@router.get("/types")
def get_presentation_types():
    return ["Bote", "Botella", "Garrafón", "Barril", "Costal", "Bolsa", "Caja", "Saco", "Sobre", "Tambor"]

@router.get("/product/{product_id}", response_model=List[PresentationResponse])
def get_presentations_for_product(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductPresentation).filter(ProductPresentation.product_id == product_id).all()

@router.post("/", response_model=PresentationResponse)
def create_presentation(payload: PresentationCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.is_default:
        db.query(ProductPresentation).filter(ProductPresentation.product_id == payload.product_id).update({"is_default": False})

    presentation = ProductPresentation(**payload.model_dump())
    db.add(presentation)
    db.commit()
    db.refresh(presentation)
    return presentation

@router.put("/{presentation_id}", response_model=PresentationResponse)
def update_presentation(presentation_id: int, payload: PresentationUpdate, db: Session = Depends(get_db)):
    presentation = db.query(ProductPresentation).filter(ProductPresentation.id == presentation_id).first()
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    data = payload.model_dump(exclude_unset=True)
    if data.get("is_default") is True:
        db.query(ProductPresentation).filter(
            ProductPresentation.product_id == presentation.product_id,
            ProductPresentation.id != presentation_id
        ).update({"is_default": False})

    for key, value in data.items():
        setattr(presentation, key, value)

    db.commit()
    db.refresh(presentation)
    return presentation

@router.delete("/{presentation_id}")
def delete_presentation(presentation_id: int, db: Session = Depends(get_db)):
    presentation = db.query(ProductPresentation).filter(ProductPresentation.id == presentation_id).first()
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    db.delete(presentation)
    db.commit()
    return {"ok": True}
