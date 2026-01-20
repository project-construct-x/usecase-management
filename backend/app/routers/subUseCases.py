import uuid
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db import SessionLocal, get_db
from .. import crud
from ..models import models
from ..schemas import schemas
from ..config import IMAGE_DIR

router = APIRouter(prefix="/subusecases", tags=["Sub Use Cases"])

# -------LIST--------
@router.get("/", response_model=list[schemas.SubUseCase])
def list_subUseCases(db: Session = Depends(get_db)):
    return crud.get_subUseCases(db)

# ---------GET---------
@router.get("/{id}", response_model=schemas.SubUseCase)
def get_subUseCase(id: int, db: Session = Depends(get_db)):
    subUseCase = crud.get_subUseCase_by_id(db, id)
    if not subUseCase:
        raise HTTPException(status_code=404, detail="SubUseCase nicht gefunden")
    return subUseCase

@router.get("/by-role/{role_id}", response_model=list[schemas.SubUseCase])
def list_subUseCases_by_role(role_id: int, db: Session = Depends(get_db)):
    return crud.get_subUseCases_by_role(db, role_id)

# --------CREATE--------
@router.post("/", response_model=schemas.SubUseCase)
def create_subUseCase(data: schemas.SubUseCaseCreate, db: Session = Depends(get_db)):
    roles = db.query(models.Role).filter(models.Role.id.in_(data.roles)).all()
    if len(roles) != len(data.roles):
        raise HTTPException(status_code=400, detail="Eine oder mehrere Rollen nicht gefunden")
    return crud.create_subUseCase(db, data, roles)

# --------UPDATE--------
@router.put("/{id}", response_model=schemas.SubUseCase)
def update_subUseCase(id: int, data: schemas.SubUseCaseUpdate, db: Session = Depends(get_db)):
    subUseCase = crud.get_subUseCase_by_id(db, id)
    if not subUseCase:
        raise HTTPException(status_code=404, detail="Sub Use Case nicht gefunden")

    roles = db.query(models.Role).filter(models.Role.id.in_(data.roles)).all()
    if len(roles) != len(data.roles):
        raise HTTPException(status_code=400, detail="Eine oder mehrere Rollen nicht gefunden")

    return crud.update_subUseCase(db, id, data, roles)

# ---------DELETE--------
@router.delete("/{id}", status_code=204)
def delete_subUseCase(id: int, db: Session = Depends(get_db)):
    subUseCase = crud.get_subUseCase_by_id(db, id)
    if not subUseCase:
        raise HTTPException(status_code=404, detail="Sub Use Case nicht gefunden")

    crud.delete_subUseCase(db, id)
    return None

# --------UPLOAD BPMN---------
@router.post("/{id}/upload-bpmn", response_model=schemas.SubUseCase)
async def upload_bpmn_for_subUseCase(
        id: int,
        file: UploadFile = File(..., description="BPMN-Modell als PNG-Datei hochladen."),
        db: Session = Depends(get_db)
):
    if not crud.get_subUseCase_by_id(db, id):
        raise HTTPException(status_code=404, detail="Sub Use Caes nicht gefunden.")

    if file.content_type != "image/png":
        raise HTTPException(status_code=400, detail="Nur PNG-Dateien sind erlaubt.")

    file_extension = ".png"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_location = os.path.join(IMAGE_DIR, unique_filename)

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Datei: {e}")

    public_url = f"/static/images/{unique_filename}"

    updated_subUseCase = crud.update_subUseCase_bpmn_url(db, id, public_url)

    if not updated_subUseCase:
        try: os.remove(file_location)
        except: pass
        raise HTTPException(status_code=500, detail="Datenbank-Update fehlgeschlagen.")
    return updated_subUseCase
