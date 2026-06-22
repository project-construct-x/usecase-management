from sqlalchemy.orm import Session
from ..schemas.properties import *
from ..models import models
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from .base import set_creation_timestamps


# -----------------------PROPERTIES-----------------------------
def get_properties(db: Session, skip: int = 0, limit: int = 1000) -> List[models.Property]:
    return db.query(models.Property).offset(skip).limit(limit).all()

def get_property_by_uuid(db: Session, uuid: UUID) -> Optional[models.Property]:
    return db.query(models.Property).get(uuid)


def create_property(db: Session, prop: PropertyCreate) -> models.Property:
    db_prop = models.Property(**prop.dict())
    set_creation_timestamps(db_prop)

    # Nur dieses Feld manuell setzen (das ist nicht im Schema)
    db_prop.groups = db_prop.groups or []  # Statt [uuid4()]

    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

def update_property(db: Session, uuid: UUID, prop: PropertyUpdate) -> Optional[models.Property]:
    db_prop = get_property_by_uuid(db, uuid=uuid)
    if not db_prop:
        return None

    update_data = prop.dict(exclude_unset=True)
    update_data["date_of_change"] = datetime.now()

    for field, value in update_data.items():
        setattr(db_prop, field, value)

    db.commit()
    db.refresh(db_prop)
    return db_prop

def delete_property(db: Session, uuid: UUID) -> bool:
    db_prop = get_property_by_uuid(db, uuid=uuid)
    if not db_prop:
        return False

    db.delete(db_prop)
    db.commit()
    return True

def get_properties_by_group(db: Session, group_uuid: UUID) -> List[models.Property]:
    return db.query(models.Property).filter(models.Property.groups.contains([group_uuid])).all()

def search_properties(db: Session, search_term: str, limit: int = 50) -> List[models.Property]:
    return db.query(models.Property).filter(
        (models.Property.name.ilike(f"%{search_term}%")) |
        (models.Property.definition.ilike(f"%{search_term}%"))
    ).limit(limit).all()
