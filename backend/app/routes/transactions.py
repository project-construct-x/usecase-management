from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import crud, schemas

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# --------LIST--------
@router.get("/", response_model=list[schemas.Transaction])
def list_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)

# --------GET---------
@router.get("/{id}", response_model=schemas.Transaction)
def get_transaction(id: int, db:Session = Depends(get_db)):
    transaction = crud.get_transaction_by_id(db, id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    return transaction

# --------CREATE-------
@router.post("/", response_model=schemas.Transaction)
def create_transaction(data: schemas.TransactionMutate, db: Session = Depends(get_db)):
    return crud.create_transaction(db, data)

# --------UPDATE-------
@router.put("/{id}", response_model=schemas.Transaction)
def update_transaction(id: int, data: schemas.TransactionMutate, db: Session = Depends(get_db)):
    transaction = crud.get_transaction_by_id(db, id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    return crud.update_transaction(db, id, data)

# --------DELETE-------
@router.delete("/{id}", status_code=204)
def delete_transaction(id: int, db: Session = Depends(get_db)):
    transaction = crud.get_transaction_by_id(db, id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    crud.delete_transaction(db, id)
    return None