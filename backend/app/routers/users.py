from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..crud.auth import (
    authenticate_user, create_access_token, get_current_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES,
    require_role, generate_api_key, get_user_by_email, get_user_by_username)
from ..schemas.users import UserCreate, User as UserSchema, UserUpdate, Token, APIKeyCreate, APIKeyResponse
from ..models.users import User, RoleEnum, APIKey

# Auth Endpoints
auth_router = APIRouter(tags=["Auth"])

@auth_router.post("/token", response_model=Token)
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/register", response_model=UserSchema, status_code=201)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Prüfe, ob Email bereits exisitiert
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Prüfe, ob Username bereits existiert
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# User Endpoints
user_router = APIRouter(prefix="/users", tags=["Users"])
@user_router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    if isinstance(current_user, dict):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return current_user

@user_router.get("/", response_model=List[UserSchema])
async def list_users(db: Session = Depends(get_db), current_user = Depends(require_role(RoleEnum.READ))):
    users = db.query(User).all()
    return users

@user_router.put("/{user_id}", response_model=UserSchema)
async def update_user(
        user_id: int,
        user_update: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role(RoleEnum.WRITE)),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@user_router.delete("/{user_id}", status_code=204)
async def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role(RoleEnum.WRITE)),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return None


# API Key Endpoints
api_router = APIRouter(prefix="/api-keys", tags=["API-Keys"])

@api_router.post("", response_model=APIKeyResponse, status_code=201)
async def create_api_key(
        api_key_data: APIKeyCreate,
        db: Session = Depends(get_db),
        current_user = Depends(require_role(RoleEnum.WRITE))
):
    key = generate_api_key()
    db_api_key = APIKey(
        key=key,
        name=api_key_data.name,
        role=api_key_data.role,
        expires_at=api_key_data.expires_at
    )
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key

@api_router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(
        db: Session = Depends(get_db),
        current_user = Depends(require_role(RoleEnum.READ))
):
    keys = db.query(APIKey).all()
    return keys

@api_router.delete("/{key_id}", status_code=204)
async def delete_api_key(
        key_id: int,
        db: Session = Depends(get_db),
        current_user = Depends(require_role(RoleEnum.WRITE))
):
    db_key = db.query(APIKey).filter(APIKey.id == key_id).first()
    if not db_key:
        raise HTTPException(status_code=404, detail="Key not found")

    db.delete(db_key)
    db.commit()
    return None