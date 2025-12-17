from pydantic import BaseModel
from typing import List, Optional


# ----------Role---------
class RoleBase(BaseModel):
    name: str
    definition: str

class RoleMutate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    class Config:
        orm_mode = True


# --------SubUseCase-------
class SubUseCaseBase(BaseModel):
    name: str
    useCase_id: int
    description: str

class SubUseCaseCreate(SubUseCaseBase):
    roles: List[int] = []

class SubUseCaseUpdate(SubUseCaseBase):
    roles: List[int] = []

class SubUseCase(SubUseCaseBase):
    id: int
    roles: List[Role] = []
    bpmn_png_url: Optional[str] = None
    class Config:
        orm_mode = True


# --------UseCase-------
class UseCaseBase(BaseModel):
    name: str
    keywords: Optional[List[str]] = None

class UseCaseCreate(UseCaseBase):
    roles: List[int] = []

class UseCaseUpdate(UseCaseBase):
    roles: List[int] = []

class UseCase(UseCaseBase):
    id: int
    roles: List[Role] = []
    subUseCases: List[SubUseCase] = []
    class Config:
        orm_mode = True


# --------Transaction-------
class TransactionBase(BaseModel):
    name: str
    subUseCase_id: int
    usesDataspace: bool
    roleOut_id: int
    roleIn_id: int

class TransactionMutate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    class Config:
        orm_mode = True


# --------Property-------
class PropertyBase(BaseModel):
    name: str
