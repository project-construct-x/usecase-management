from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from .common import TimestampedEntityBase, MultiLangField, TimestampedEntityResponse

class PropertyBase(TimestampedEntityBase):
    dynamic: bool

    # Property-spezifische optionale Felder
    list_of_replaced_properties: Optional[List[UUID]] = None
    list_of_replacing_properties: Optional[List[UUID]] = None
    description: Optional[MultiLangField] = None
    examples: Optional[MultiLangField] = None
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
    name: Optional[MultiLangField] = None
    definition: Optional[MultiLangField] = None
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
    description: Optional[MultiLangField] = None
    examples: Optional[MultiLangField] = None
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

class PropertyShort(BaseModel):
    UUID: UUID
    name: MultiLangField
    definition: MultiLangField

    class Config:
        from_attributes = True