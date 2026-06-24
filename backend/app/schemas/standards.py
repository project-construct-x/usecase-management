from pydantic import BaseModel
from typing import List, Optional
from ..models.models import StandardCategory
from .common import UseCaseShort
from datetime import datetime

class StandardBase(BaseModel):
    number: str
    category: StandardCategory
    title: str
    subTitle: Optional[str] = None
    date: Optional[str] = None
    reference_URL: Optional[str] = None
    keywords: Optional[List[str]] = None
    description: Optional[str] = None

class StandardMutate(StandardBase):
    useCase_ids: list[int] = []
    version: int
    pass

class Standard(StandardBase):
    id: int
    useCases: list[UseCaseShort] = []
    version: int
    updated_at: datetime | None = None
    updated_by: str | None = None
    class Config:
        from_attributes = True