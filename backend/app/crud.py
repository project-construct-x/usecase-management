import os
import logging
from sqlalchemy.orm import Session
from . import models, schemas
from .config import IMAGE_DIR
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# ----------Roles---------
def get_roles(db: Session):
    return db.query(models.Role).all()

def get_role_by_id(db: Session, role_id: int):
    return db.query(models.Role).get(role_id)

def create_role(db: Session, data: schemas.RoleMutate):
    role = models.Role(**data.dict())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def update_role(db: Session, role_id: int, data: schemas.RoleMutate):
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


# --------UseCases-------
def get_useCases(db: Session):
    return db.query(models.UseCase).all()

def get_useCase_by_id(db: Session, useCase_id: int):
    return db.query(models.UseCase).get(useCase_id)

def create_useCase(db: Session, data: schemas.UseCaseCreate, roles: list):
    uc = models.UseCase(name=data.name, keywords=data.keywords, roles=roles)
    db.add(uc)
    db.commit()
    db.refresh(uc)
    return uc

def update_useCase(db: Session, useCase_id: int, data: schemas.UseCaseUpdate, roles: list):
    uc = db.query(models.UseCase).get(useCase_id)
    uc.name = data.name
    uc.keywords = data.keywords
    uc.roles = roles

    db.commit()
    db.refresh(uc)
    return uc

def delete_useCase(db: Session, useCase_id: int):
    uc = db.query(models.UseCase).get(useCase_id)
    db.delete(uc)
    db.commit()


# -------SubUseCases-----
def get_subUseCases(db: Session):
    return db.query(models.SubUseCase).all()

def get_subUseCases_by_role(db: Session, role_id: int):
    return db.query(models.SubUseCase).join(
        models.SubUseCase.roles
    ).filter(
        models.Role.id == role_id
    ).all()

def get_subUseCase_by_id(db: Session, subUseCase_id: int):
    return db.query(models.SubUseCase).get(subUseCase_id)

def create_subUseCase(db: Session, data: schemas.SubUseCaseCreate, roles: list):
    sub = models.SubUseCase()
    sub.name = data.name
    sub.description = data.description
    sub.roles = roles
    sub.useCase_id = data.useCase_id

    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

def update_subUseCase(db: Session, subUseCase_id: int, data: schemas.SubUseCaseUpdate, roles: list):
    sub = db.query(models.SubUseCase).get(subUseCase_id)
    sub.name = data.name
    sub.description = data.description
    sub.roles = roles
    sub.useCase_id = data.useCase_id

    db.commit()
    db.refresh(sub)
    return sub

def delete_subUseCase(db: Session, subUseCase_id: int):
    sub = db.query(models.SubUseCase).get(subUseCase_id)
    db.delete(sub)
    db.commit()

def update_subUseCase_bpmn_url(db: Session, subUseCase_id: int, image_url: str):
    sub = db.query(models.SubUseCase).get(subUseCase_id)

    if sub:
        old_image_url = sub.bpmn_png_url
        if old_image_url:
            try:
                filename = os.path.basename(old_image_url)
                old_file_path = os.path.join(IMAGE_DIR, filename)

                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
                    logging.info(f"Deleted old file: {old_file_path}")
            except Exception as e:
                logging.error(f"Error while deleting old file {old_image_url}: {e}")

        sub.bpmn_png_url = image_url
        print(f"CRUD SAVED TO {image_url}")
        db.commit()
        db.refresh(sub)
        return sub
    return None


# --------Transactions-------
def get_transactions(db: Session):
    return db.query(models.Transaction).all()

def get_transaction_by_id(db: Session, transaction_id: int):
    return db.query(models.Transaction).get(transaction_id)

def create_transaction(db: Session, data: schemas.TransactionMutate):
    transaction = models.Transaction(**data.dict())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def update_transaction(db: Session, transaction_id: int, data: schemas.TransactionMutate):
    transaction = db.query(models.Transaction).get(transaction_id)
    transaction.name = data.name
    transaction.subUseCase_id = data.subUseCase_id
    transaction.usesDataspace = data.usesDataspace
    transaction.roleOut_id = data.roleOut_id
    transaction.roleIn_id = data.roleIn_id
    db.commit()
    db.refresh(transaction)
    return transaction

def delete_transaction(db: Session, transaction_id: int):
    transaction = db.query(models.Transaction).get(transaction_id)
    db.delete(transaction)
    db.commit()


# -------------Properties---------------
def get_properties(db: Session, skip: int = 0, limit: int = 100) -> List[models.Property]:
    return db.query(models.Property).offset(skip).limit(limit).all()

def get_property_by_uuid(db: Session, uuid: UUID) -> Optional[models.Property]:
    return db.query(models.Property).get(uuid)


def create_property(db: Session, prop: schemas.PropertyCreate) -> models.Property:
    db_prop = models.Property(
        active=prop.active,
        date_of_activation=prop.date_of_activation,
        date_of_change=prop.date_of_change,
        date_of_revision=prop.date_of_revision,
        date_of_version=prop.date_of_version,
        date_of_deactivation=prop.date_of_deactivation,
        version=prop.version,
        number_of_revision=prop.number_of_revision,
        list_of_replaced_properties=prop.list_of_replaced_properties,
        list_of_replacing_properties=prop.list_of_replacing_properties,
        reason_for_rejection=prop.reason_for_rejection,
        relation_to_other_catalogues=prop.relation_to_other_catalogues,
        language_of_creator=prop.language_of_creator,
        name=prop.name,
        definition=prop.definition,
        description=prop.description,
        examples=prop.examples,
        related_properties=prop.related_properties,
        groups=prop.groups,
        symbols=prop.symbols,
        picture_url=prop.picture_url,
        used_in_countries=prop.used_in_countries,
        subdivision_of_usage=prop.subdivision_of_usage,
        country_of_origin=prop.country_of_origin,
        physical_quantity=prop.physical_quantity,
        dimension=prop.dimension,
        measurement_method=prop.measurement_method,
        data_type=prop.data_type,
        dynamic=prop.dynamic,
        dynamic_parameter=prop.dynamic_parameter,
        units=prop.units,
        name_of_defining_values=prop.name_of_defining_values,
        defining_values=prop.defining_values,
        tolerance=prop.tolerance,
        digital_format=prop.digital_format,
        textformat=prop.textformat,
        possible_values=prop.possible_values,
        limit_values=prop.limit_values,
    )

    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

def update_property(db: Session, uuid: UUID, prop: schemas.PropertyUpdate) -> Optional[models.Property]:
    db_prop = get_property_by_uuid(db, uuid=uuid)
    if not db_prop:
        return None

    update_data = property.dict(exclude_unset=True)
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
