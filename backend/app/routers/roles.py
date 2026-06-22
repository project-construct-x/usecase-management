from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import roles as crud
from ..db import get_db
from ..schemas.roles import *

router = APIRouter(prefix="/roles", tags=["Roles"])

# ---------LIST--------
@router.get("/", response_model=list[Role])
def list_roles(db: Session = Depends(get_db)):
    return crud.get_roles(db)

# ---------GET---------
@router.get("/{id}", response_model=Role)
def get_role(id: int, db: Session = Depends(get_db)):
    role = crud.get_role_by_id(db, id)
    if not role:
        raise HTTPException(status_code=404, detail="Role nicht gefunden")
    return role

# ---------CREATE--------
@router.post("/", response_model=Role)
def create_role(data: RoleMutate, db: Session = Depends(get_db)):
    return crud.create_role(db, data)

# ---------UPDATE--------
@router.put("/{id}", response_model=Role)
def update_role(id: int, data: RoleMutate, db: Session = Depends(get_db)):
    role = crud.get_role_by_id(db, id)
    if not role:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden")
    return crud.update_role(db, id, data)

# ---------DELETE--------
@router.delete("/{id}", status_code=204)
def delete_role(id: int, db: Session = Depends(get_db)):
    role = crud.get_role_by_id(db, id)
    if not role:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden")
    crud.delete_role(db, id)
    return None