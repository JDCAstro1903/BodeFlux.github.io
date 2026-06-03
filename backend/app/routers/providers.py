from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.provider import Provider
from ..schemas.provider import ProviderCreate, ProviderResponse, ProviderUpdate

router = APIRouter(prefix="/api/providers", tags=["Providers"])


@router.get("/", response_model=List[ProviderResponse])
def list_providers(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """List all providers."""
    query = db.query(Provider)
    if search:
        query = query.filter(Provider.name.ilike(f"%{search}%") | Provider.contact.ilike(f"%{search}%"))
    if category:
        query = query.filter(Provider.category == category)
    if min_rating is not None:
        query = query.filter(Provider.rating >= min_rating)
        
    providers = query.order_by(Provider.created_at.desc()).all()
    return [ProviderResponse.model_validate(p) for p in providers]


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    """Get a single provider by ID."""
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return ProviderResponse.model_validate(provider)


@router.post("/", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider(payload: ProviderCreate, db: Session = Depends(get_db)):
    """Create a new provider."""
    provider = Provider(
        name=payload.name,
        contact=payload.contact,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        category=payload.category,
        rating=0.0,
        status="active",
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return ProviderResponse.model_validate(provider)


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: int,
    payload: ProviderUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing provider."""
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(provider, key, value)

    db.commit()
    db.refresh(provider)
    return ProviderResponse.model_validate(provider)


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_provider(provider_id: int, db: Session = Depends(get_db)):
    """Delete a provider."""
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(provider)
    db.commit()
