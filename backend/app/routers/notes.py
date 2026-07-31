from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db, engine
from app.database import models
from app.schemas.note import NoteCreate, NoteResponse
from app.core.security import get_current_user_optional, get_current_user

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.get("/", response_model=List[NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    if not current_user:
        return []

    try:
        notes = db.query(models.Notes).filter(models.Notes.user_id == current_user.id).order_by(models.Notes.id.desc()).all()
        return notes
    except Exception:
        db.rollback()
        try:
            models.Base.metadata.create_all(bind=engine)
            return db.query(models.Notes).filter(models.Notes.user_id == current_user.id).order_by(models.Notes.id.desc()).all()
        except Exception:
            return []


@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    existing_note = (
        db.query(models.Notes)
        .filter(models.Notes.user_id == current_user.id, models.Notes.name == note.name)
        .first()
    )

    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A note with this title already exists in your BrainVault."
        )

    new_note = models.Notes(
        user_id=current_user.id,
        name=note.name,
        description=note.description,
        file_url=note.file_url,
        file_type=note.file_type,
        file_name=note.file_name,
        extracted_text=note.extracted_text,
        text_content=note.text_content
    )

    try:
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note
    except Exception:
        db.rollback()
        models.Base.metadata.create_all(bind=engine)
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    note = db.query(models.Notes).filter(models.Notes.id == note_id, models.Notes.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.name = note_data.name
    note.description = note_data.description
    if note_data.text_content is not None:
        note.text_content = note_data.text_content
    if note_data.extracted_text is not None:
        note.extracted_text = note_data.extracted_text

    db.commit()
    db.refresh(note)
    return note