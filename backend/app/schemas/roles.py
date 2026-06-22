from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    definition: str

class RoleMutate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    class Config:
        from_attributes = True
