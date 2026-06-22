from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.models import PropertyGroupCategory
from .common import TimestampedEntityBase, MultiLangField, TimestampedEntityResponse
from .properties import PropertyShort

class PropertyGroupBase(TimestampedEntityBase):
    category: PropertyGroupCategory

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
    name: Optional[MultiLangField] = None
    definition: Optional[MultiLangField] = None
    category: Optional[PropertyGroupCategory] = None
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

class PropertyGroupShort(BaseModel):
    UUID: UUID
    name: MultiLangField
    category: str

    class Config:
        from_attributes = True

class ClassWithProperties(BaseModel):
    uuid: str
    name: MultiLangField
    properties: list[PropertyShort]