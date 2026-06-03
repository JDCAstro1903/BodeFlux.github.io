from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, UserUpdate
from ..utils.security import get_current_user, hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])


def require_executive(current_user: User = Depends(get_current_user)) -> User:
    """Only executive users can manage other users."""
    if current_user.role != "executive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los ejecutivos pueden gestionar usuarios",
        )
    return current_user


@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_executive),
):
    """Return all users."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_executive),
):
    """Create a new user (warehouse or sales). Executive role only."""
    existing = db.query(User).filter(User.employee_id == payload.employee_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El ID de empleado '{payload.employee_id}' ya está registrado",
        )

    # email is optional when creating from admin panel
    email_val = payload.email or f"{payload.employee_id.lower()}@agrostack.local"

    # Check email uniqueness only if a real email was provided
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )

    user = User(
        employee_id=payload.employee_id,
        name=payload.name,
        email=email_val,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_executive),
):
    """Toggle a user's active status. Executive role only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Prevent executives from deactivating themselves
    if user.id == current_user.id and payload.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivarte a ti mismo",
        )

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
