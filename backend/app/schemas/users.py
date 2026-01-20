from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from ..models.users import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    role: RoleEnum = RoleEnum.READ

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = True

class User(UserBase):
    id: int
    role: RoleEnum
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class APIKeyCreate(BaseModel):
    name: str
    role: RoleEnum = RoleEnum.READ
    expires_at: Optional[datetime] = None

class APIKeyResponse(BaseModel):
    id: int
    key: str
    name: str
    role: RoleEnum
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

