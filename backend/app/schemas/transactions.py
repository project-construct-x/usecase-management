from pydantic import BaseModel, model_validator
from typing import Optional
from uuid import UUID
from .roles import Role
from .properties import PropertyShort

class Transaction(BaseModel):
    id: int
    name: str
    process_number: Optional[str] = None
    subUseCase_name: str | None = None
    subUseCase_id: int
    usesDataspace: bool
    roleOut: Role
    roleIn: Role
    related_class_id: Optional[str] = None
    data_carrier: Optional[str] = None
    dataformat_available: Optional[str] = None
    dataformat: Optional[str] = None
    timing: Optional[str] = None
    policies: Optional[str] = None
    data_size: Optional[str] = None
    properties: list[PropertyShort] = []

    @model_validator(mode="before")
    @classmethod
    def extract_sub_use_case_name(cls, data):
        if hasattr(data, "subUseCase") and data.subUseCase:
            data.__dict__["subUseCase_name"] = data.subUseCase.name
        return data

    class Config:
        from_attributes = True

class TransactionMutate(BaseModel):
    process_number: Optional[str] = None
    name: str
    subUseCase_id: int | None = None
    usesDataspace : bool
    roleOut_id: int
    roleIn_id: int
    related_class_id: Optional[str] = None
    data_carrier: Optional[str] = None
    dataformat_available: Optional[str] = None
    dataformat: Optional[str] = None
    timing: Optional[str] = None
    policies: Optional[str] = None
    data_size: Optional[str] = None
    property_uuids: list[UUID] = []