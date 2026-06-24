from pydantic import BaseModel
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    definition: str

class RoleMutate(RoleBase):
    version: int
    pass

class Role(RoleBase):
    id: int
    version: int
    updated_at: datetime | None = None
    updated_by: str | None = None
    class Config:
        from_attributes = True
