from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class MultiLangField(BaseModel):
    en: Optional[str] = None
    de: Optional[str] = None

class TimestampedEntityBase(BaseModel):
    """Gemeinsame Felder für Property und PropertyGroup"""
    active: bool
    version: int
    language_of_creator: str
    name: MultiLangField
    definition: MultiLangField

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

class UseCaseShort(BaseModel):
    id: int
    name: str
    conx_id: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True