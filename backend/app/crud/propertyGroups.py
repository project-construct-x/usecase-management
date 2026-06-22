from sqlalchemy.orm import Session
from ..schemas.propertyGroups import *
from .properties import get_properties_by_group
from ..models import models
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from .base import set_creation_timestamps

# -----------------------PROPERTY GROUP------------------------
def get_propertyGroups(db: Session, skip: int = 0, limit: int = 100) -> List[models.PropertyGroup]:
    """Alle PropertyGroups mit Pagination abrufen"""
    return db.query(models.PropertyGroup).offset(skip).limit(limit).all()


def get_propertyGroup_by_uuid(db: Session, uuid: UUID) -> Optional[models.PropertyGroup]:
    return db.query(models.PropertyGroup).filter(models.PropertyGroup.UUID == uuid).first()


def create_propertyGroup(db: Session, property_group: PropertyGroupCreate) -> models.PropertyGroup:
    db_property_group = models.PropertyGroup(**property_group.dict())
    set_creation_timestamps(db_property_group)

    db.add(db_property_group)
    db.commit()
    db.refresh(db_property_group)
    return db_property_group


def update_propertyGroup(db: Session, uuid: UUID, property_group: PropertyGroupUpdate) -> Optional[models.PropertyGroup]:
    db_property_group = get_propertyGroup_by_uuid(db, uuid=uuid)
    if not db_property_group:
        return None

    update_data = property_group.dict(exclude_unset=True)
    update_data["date_of_change"] = datetime.now()

    for field, value in update_data.items():
        setattr(db_property_group, field, value)

    db.commit()
    db.refresh(db_property_group)
    return db_property_group


def delete_propertyGroup(db: Session, uuid: UUID) -> bool:
    db_property_group = get_propertyGroup_by_uuid(db, uuid=uuid)
    if not db_property_group:
        return False

    db.delete(db_property_group)
    db.commit()
    return True

def get_propertyGroups_by_category(db: Session, category: str, skip: int = 0, limit: int = 100) -> List[models.PropertyGroup]:
    """PropertyGroups nach Kategorie filtern"""
    return db.query(models.PropertyGroup).filter(
        models.PropertyGroup.category == category
    ).offset(skip).limit(limit).all()


def get_child_propertyGroups(db: Session, parent_uuid: UUID) -> List[models.PropertyGroup]:
    """Alle Untergruppen einer PropertyGroup abrufen"""
    return db.query(models.PropertyGroup).filter(
        models.PropertyGroup.groups.contains([parent_uuid])
    ).all()


def search_propertyGroups(db: Session, search_term: str, limit: int = 50) -> List[models.PropertyGroup]:
    """PropertyGroups nach Name oder Definition suchen"""
    return db.query(models.PropertyGroup).filter(
        (models.PropertyGroup.name.ilike(f"%{search_term}%")) |
        (models.PropertyGroup.definition.ilike(f"%{search_term}%"))
    ).limit(limit).all()

def get_class_property_tree(db: Session) -> list:
    classes = get_propertyGroups_by_category(db, category="CLASS", limit=1000)

    result = []
    for cls in classes:
        props = get_properties_by_group(db, group_uuid=cls.UUID)

        result.append({
            "uuid": str(cls.UUID),
            "name": cls.name,
            "properties": [
                {
                    "UUID": str(p.UUID),
                    "name": p.name,
                    "definition": p.definition or "",
                }
                for p in props
            ]
        })
    return result
