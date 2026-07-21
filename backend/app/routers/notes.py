from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
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
    return db.query(models.Notes).all()

@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db)
):
    existing_note = (
        db.query(models.Notes)
        .filter(models.Notes.name == note.name)
        .first()
    )

    if existing_note:
        raise HTTPException(
            status_code=409,
            detail="Note already exists"
    )

    new_note = models.Notes(**note.model_dump())

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note