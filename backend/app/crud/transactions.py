from sqlalchemy import select
from sqlalchemy.orm import Session
from ..schemas.transactions import *
from ..models import models

def get_transactions(db: Session):
    return db.query(models.Transaction).all()

def get_transactions_by_subusecase(db: Session, sub_id: int):
    return db.query(models.Transaction).filter(models.Transaction.subUseCase_id == sub_id).all()

def get_transaction_by_id(db: Session, transaction_id: int):
    return db.query(models.Transaction).get(transaction_id)

def create_transaction(db: Session, data: TransactionMutate):
    transaction = models.Transaction(**data.dict(exclude={"property_uuids"}))

    if data.property_uuids:
        props = db.execute(select(models.Property).where(models.Property.UUID.in_(data.property_uuids))).scalars().all()
        transaction.properties = props

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def update_transaction(db: Session, transaction_id: int, data: TransactionMutate):
    transaction = db.query(models.Transaction).get(transaction_id)
    transaction.name = data.name
    transaction.subUseCase_id = data.subUseCase_id
    transaction.usesDataspace = data.usesDataspace
    transaction.roleOut_id = data.roleOut_id
    transaction.roleIn_id = data.roleIn_id
    transaction.process_number = data.process_number
    transaction.related_class_id = data.related_class_id
    transaction.data_carrier = data.data_carrier
    transaction.dataformat_available = data.dataformat_available
    transaction.dataformat = data.dataformat
    transaction.timing = data.timing
    transaction.policies = data.policies
    transaction.data_size = data.data_size
    if data.property_uuids is not None:
        props = db.execute(select(models.Property).where(models.Property.UUID.in_(data.property_uuids))).scalars().all()
        transaction.properties = props

    db.commit()
    db.refresh(transaction)
    return transaction

def delete_transaction(db: Session, transaction_id: int):
    transaction = db.query(models.Transaction).get(transaction_id)
    db.delete(transaction)
    db.commit()
