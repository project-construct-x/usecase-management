from pydantic import BaseModel, model_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.models import Category


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
class SubUseCaseRoleBase(BaseModel):
    role_id: int
    motivation: Optional[str] = None
    goal: Optional[str] = None
    monetary_benefit: Optional[str] = None

class SubUseCaseRoleRead(SubUseCaseRoleBase):
    role: Role
    class Config:
        from_attributes = True

class SubUseCaseBase(BaseModel):
    name: str
    useCase_id: int
    description: str
    objective: Optional[str] = None
    inputs: Optional[str] = None
    outputs: Optional[str] = None
    potential_risks: Optional[str] = None
    distinction_from_other_sucs: Optional[str] = None
    dependency_of_other_sucs: Optional[str] = None
    assumptions: Optional[str] = None

class SubUseCaseCreate(SubUseCaseBase):
    subUseCase_roles: List[SubUseCaseRoleBase] = []

class SubUseCaseUpdate(SubUseCaseBase):
    subUseCase_roles: List[SubUseCaseRoleBase] = []

class BpmnXmlUpdate(BaseModel):
    bpmn_xml: str

class SubUseCase(SubUseCaseBase):
    id: int
    subUseCase_roles: List[SubUseCaseRoleRead] = []
    bpmn_png_url: Optional[str] = None
    bpmn_xml: Optional[str] = None
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
class Transaction(BaseModel):
    id: int
    name: str
    subUseCase_name: str | None = None
    usesDataspace: bool
    roleOut: Role
    roleIn: Role

    @model_validator(mode="before")
    @classmethod
    def extract_sub_use_case_name(cls, data):
        if hasattr(data, "subUseCase") and data.subUseCase:
            data.__dict__["subUseCase_name"] = data.subUseCase.name
        return data

    class Config:
        from_attributes = True

class TransactionMutate(BaseModel):
    name: str
    subUseCase_id: int | None = None
    usesDataspace : bool
    roleOut_id: int
    roleIn_id: int

# -------------Base for Property and PropertyGroup------------------
class TimestampedEntityBase(BaseModel):
    """Gemeinsame Felder für Property und PropertyGroup"""
    active: bool
    version: int
    language_of_creator: str
    name: str
    definition: str

    # Optionale Felder
    date_of_deactivation: Optional[datetime] = None
    number_of_revision: Optional[int] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None


class TimestampedEntityResponse(TimestampedEntityBase):
    """Response Schema mit automatisch gesetzten Timestamps"""
    UUID: UUID
    date_of_creation: datetime
    date_of_activation: datetime
    date_of_change: datetime
    date_of_revision: datetime
    date_of_version: datetime

    class Config:
        from_attributes = True

# --------Property-------
class PropertyBase(TimestampedEntityBase):
    dynamic: bool

    # Property-spezifische optionale Felder
    list_of_replaced_properties: Optional[List[UUID]] = None
    list_of_replacing_properties: Optional[List[UUID]] = None
    description: Optional[str] = None
    examples: Optional[str] = None
    related_properties: Optional[List[UUID]] = None
    symbols: Optional[List[str]] = None
    physical_quantity: Optional[List[str]] = None
    dimension: Optional[str] = None
    measurement_method: Optional[str] = None
    data_type: Optional[str] = None
    dynamic_parameter: Optional[List[UUID]] = None
    units: Optional[List[str]] = None
    name_of_defining_values: Optional[List[str]] = None
    defining_values: Optional[List[str]] = None
    tolerance: Optional[List[str]] = None
    digital_format: Optional[List[str]] = None
    textformat: Optional[str] = None
    possible_values: Optional[List[str]] = None
    limit_values: Optional[List[str]] = None
    groups: Optional[List[UUID]] = None # TODO soll eigentlich nicht optional sein

class PropertyCreate(PropertyBase):
    """Create - keine Timestamps vom Frontend"""
    pass

class PropertyUpdate(BaseModel):
    """Update - alle Felder optional"""
    active: Optional[bool] = None
    version: Optional[int] = None
    language_of_creator: Optional[str] = None
    name: Optional[str] = None
    definition: Optional[str] = None
    dynamic: Optional[bool] = None
    date_of_deactivation: Optional[datetime] = None
    number_of_revision: Optional[int] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    list_of_replaced_properties: Optional[List[UUID]] = None
    list_of_replacing_properties: Optional[List[UUID]] = None
    description: Optional[str] = None
    examples: Optional[str] = None
    related_properties: Optional[List[UUID]] = None
    symbols: Optional[List[str]] = None
    physical_quantity: Optional[List[str]] = None
    dimension: Optional[str] = None
    measurement_method: Optional[str] = None
    data_type: Optional[str] = None
    dynamic_parameter: Optional[List[UUID]] = None
    units: Optional[List[str]] = None
    name_of_defining_values: Optional[List[str]] = None
    defining_values: Optional[List[str]] = None
    tolerance: Optional[List[str]] = None
    digital_format: Optional[List[str]] = None
    textformat: Optional[str] = None
    possible_values: Optional[List[str]] = None
    limit_values: Optional[List[str]] = None
    groups: Optional[List[UUID]] = None

class PropertyResponse(PropertyBase, TimestampedEntityResponse):
    """Response mit allen Timestamps"""
    pass


# ========== PropertyGroup Schemas ==========
class PropertyGroupBase(TimestampedEntityBase):
    category: Category

    # PropertyGroup-spezifische optionale Felder
    list_of_replaced_property_groups: Optional[List[UUID]] = None
    list_of_replacing_property_groups: Optional[List[UUID]] = None
    groups: Optional[List[UUID]] = None


class PropertyGroupCreate(PropertyGroupBase):
    """Create - keine Timestamps vom Frontend"""
    pass


class PropertyGroupUpdate(BaseModel):
    """Update - alle Felder optional"""
    active: Optional[bool] = None
    version: Optional[int] = None
    language_of_creator: Optional[str] = None
    name: Optional[str] = None
    definition: Optional[str] = None
    category: Optional[Category] = None
    date_of_deactivation: Optional[datetime] = None
    number_of_revision: Optional[int] = None
    reason_for_rejection: Optional[str] = None
    relation_to_other_catalogues: Optional[str] = None
    picture_url: Optional[str] = None
    used_in_countries: Optional[List[str]] = None
    subdivision_of_usage: Optional[List[str]] = None
    country_of_origin: Optional[str] = None
    list_of_replaced_property_groups: Optional[List[UUID]] = None
    list_of_replacing_property_groups: Optional[List[UUID]] = None
    groups: Optional[List[UUID]] = None


class PropertyGroupResponse(PropertyGroupBase, TimestampedEntityResponse):
    """Response mit allen Timestamps"""
    pass