from sqlalchemy.orm import Session
from ..schemas.roles import *
from ..models import models


def get_roles(db: Session):
    return db.query(models.Role).all()

def get_role_by_id(db: Session, role_id: int):
    return db.query(models.Role).get(role_id)

def create_role(db: Session, data: RoleMutate):
    role = models.Role(**data.dict())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def update_role(db: Session, role_id: int, data: RoleMutate):
    role = db.query(models.Role).get(role_id)
    role.name = data.name
    role.definition = data.definition
    db.commit()
    db.refresh(role)
    return role

def delete_role(db: Session, role_id: int):
    role = db.query(models.Role).get(role_id)
    db.delete(role)
    db.commit()
