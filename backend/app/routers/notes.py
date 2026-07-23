from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db, engine
from app.database import models
from app.schemas.note import NoteCreate, NoteResponse

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.get("/")
def get_notes(
    db: Session = Depends(get_db)
):
    try:
        return db.query(models.Notes).all()
    except Exception as e:
        db.rollback()
        # If notes table was dropped or doesn't exist, auto-recreate table and return empty list
        try:
            models.Base.metadata.create_all(bind=engine)
            return db.query(models.Notes).all()
        except Exception:
            return []

@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db)
):
    # Ensure database table exists before querying
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    try:
        existing_note = (
            db.query(models.Notes)
            .filter(models.Notes.name == note.name)
            .first()
        )
    except Exception:
        db.rollback()
        models.Base.metadata.create_all(bind=engine)
        existing_note = None

    if existing_note:
        raise HTTPException(
            status_code=409,
            detail="Note already exists"
        )

    new_note = models.Notes(**note.model_dump())

    try:
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note
    except Exception as e:
        db.rollback()
        # Auto-recreate table if dropped and retry
        models.Base.metadata.create_all(bind=engine)
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note