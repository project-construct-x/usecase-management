from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .roles import Role
from .subUseCases import SubUseCase
from .standards import Standard

class UseCaseBase(BaseModel):
    name: str
    keywords: Optional[List[str]] = None
    description: Optional[str] = None
    relation_to_other_useCases: Optional[str] = None
    uc_owner_institution: Optional[str] = None
    uc_owner: Optional[str] = None
    conx_id: Optional[str] = None

class UseCaseCreate(UseCaseBase):
    roles: List[int] = []

class UseCaseUpdate(UseCaseBase):
    roles: List[int] = []
    version: int

class UseCase(UseCaseBase):
    id: int
    version: int
    updated_at: datetime | None = None
    updated_by: str | None = None
    roles: List[Role] = []
    subUseCases: List[SubUseCase] = []
    standards: List[Standard] = []
    class Config:
        from_attributes = True