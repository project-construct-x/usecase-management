from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime


# ----------Role---------
class RoleBase(BaseModel):
    name: str
    definition: str

class RoleMutate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    class Config:
        from_attributes = True


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
        from_attributes = True


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
        from_attributes = True


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
        from_attributes = True


# --------Property-------
class PropertyBase(BaseModel):
    active: bool
    date_of_activation: datetime
    date_of_change: datetime
    date_of_revision: datetime
    date_of_version: datetime
    version: int
    language_of_creator: str
    name: str
    definition: str
    groups: List[UUID]

    # Optionale Felder
    date_of_deactivation: Optional[datetime] = None
    number_of_revision: Optional[int] = None
    list_of_replaced_properties: Optional[List[UUID]] = None
    list_of_replacing_properties: Optional[List[UUID]] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    description: Optional[str] = None
    examples: Optional[str] = None
    related_properties: Optional[List[UUID]] = None
    symbols: Optional[List[str]] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    physical_quantity: Optional[List[str]] = None
    dimension: Optional[str] = None
    measurement_method: Optional[str] = None
    data_type: Optional[str] = None
    dynamic: Optional[str] = None
    dynamic_parameter: Optional[List[UUID]] = None
    units: Optional[List[str]] = None
    name_of_defining_values: Optional[List[str]] = None
    defining_values: Optional[List[str]] = None
    tolerance: Optional[List[str]] = None
    digital_format: Optional[List[str]] = None
    textformat: Optional[str] = None
    possible_values: Optional[List[str]] = None
    limit_values: Optional[List[str]] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    """Schema für das Aktualisieren eines Properties - alle Felder optional"""
    active: Optional[bool] = None
    date_of_activation: Optional[datetime] = None
    date_of_revision: Optional[datetime] = None
    date_of_version: Optional[datetime] = None
    date_of_deactivation: Optional[datetime] = None
    version: Optional[int] = None
    number_of_revision: Optional[int] = None
    list_of_replaced_properties: Optional[List[UUID]] = None
    list_of_replacing_properties: Optional[List[UUID]] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    language_of_creator: Optional[str] = None
    name: Optional[str] = None
    definition: Optional[str] = None
    description: Optional[str] = None
    examples: Optional[str] = None
    related_properties: Optional[List[UUID]] = None
    groups: Optional[List[UUID]] = None
    symbols: Optional[List[str]] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    physical_quantity: Optional[List[str]] = None
    dimension: Optional[str] = None
    measurement_method: Optional[str] = None
    data_type: Optional[str] = None
    dynamic: Optional[str] = None
    dynamic_parameter: Optional[List[UUID]] = None
    units: Optional[List[str]] = None
    name_of_defining_values: Optional[List[str]] = None
    defining_values: Optional[List[str]] = None
    tolerance: Optional[List[str]] = None
    digital_format: Optional[List[str]] = None
    textformat: Optional[str] = None
    possible_values: Optional[List[str]] = None
    limit_values: Optional[List[str]] = None

class PropertyResponse(PropertyBase):
    UUID: UUID
    date_of_creation: datetime

    class Config:
        from_attributes = True


# --------Property Group---------
class PropertyGroupBase(BaseModel):
    active: bool
    date_of_activation: datetime
    date_of_change: datetime
    date_of_revision: datetime
    date_of_version: datetime
    version: int
    language_of_creator: str
    name: str
    definition: str
    category: str

    # Optionale Felder
    date_of_deactivation: Optional[datetime] = None
    number_of_revision: Optional[int] = None
    list_of_replaced_property_groups: Optional[List[UUID]] = None
    list_of_replacing_property_groups: Optional[List[UUID]] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    groups: Optional[List[UUID]] = None


class PropertyGroupCreate(PropertyGroupBase):
    pass


class PropertyGroupUpdate(BaseModel):
    """Alle Felder optional für Update"""
    active: Optional[bool] = None
    date_of_activation: Optional[datetime] = None
    date_of_revision: Optional[datetime] = None
    date_of_version: Optional[datetime] = None
    date_of_deactivation: Optional[datetime] = None
    version: Optional[int] = None
    number_of_revision: Optional[int] = None
    list_of_replaced_property_groups: Optional[List[UUID]] = None
    list_of_replacing_property_groups: Optional[List[UUID]] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    language_of_creator: Optional[str] = None
    name: Optional[str] = None
    definition: Optional[str] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    category: Optional[str] = None
    groups: Optional[List[UUID]] = None


class PropertyGroupResponse(PropertyGroupBase):
    UUID: UUID
    date_of_creation: datetime

    class Config:
        from_attributes = True