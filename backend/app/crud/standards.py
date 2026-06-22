from sqlalchemy.orm import Session, selectinload
from ..schemas.standards import *
from ..models import models
from .useCases import get_useCase_by_id

# ------------------STANDARDS---------------
def get_standards(db: Session):
    return (
        db.query(models.Standard)
        .options(selectinload(models.Standard.useCases))
        .all()
    )

def get_standard_by_id(db: Session, standard_id: int):
    return (
        db.query(models.Standard)
        .options(selectinload(models.Standard.useCases))
        .filter(models.Standard.id == standard_id)
        .first()
    )

def create_standard(db: Session, data: StandardMutate):
    payload = data.model_dump(exclude={"useCase_ids"})
    standard = models.Standard(**payload)

    usecase_ids = getattr(data, "useCase_ids", []) or []
    standard.useCases = [get_useCase_by_id(db, id) for id in usecase_ids]

    db.add(standard)
    db.commit()
    db.refresh(standard)
    return standard

def update_standard(db: Session, standard_id: int, data: StandardMutate):
    s = db.query(models.Standard).get(standard_id)
    if not s:
        return None
    s.number = data.number
    s.category = data.category
    s.title = data.title
    s.subTitle = data.subTitle
    s.date = data.date
    s.reference_URL = data.reference_URL
    s.keywords = data.keywords
    s.description = data.description

    if data.useCase_ids is not None:
        usecases = [get_useCase_by_id(db, i) for i in data.useCase_ids]
        missing = [i for i, uc in zip(data.useCase_ids, usecases) if uc is None]
        if missing:
            raise ValueError(f"UseCases nicht gefunden: {missing}")
        s.useCases = [uc for uc in usecases if uc is not None]

    db.commit()
    db.refresh(s)
    return s

def delete_standard(db: Session, standard_id: int):
    s = db.query(models.Standard).get(standard_id)
    db.delete(s)
    db.commit()
