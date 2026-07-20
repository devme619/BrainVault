from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, session
import app.database_models as database_models
from app.models import NoteCreate, NoteResponse

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind=engine)


@app.get("/")
def greet():
    return {"message": "Welcome to BrainVault"}


def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()


# Seed initial data
# def init_db():
#     db = session()
#     try:
#         if db.query(database_models.Notes).count() == 0:
#             notes = [
#                 database_models.Notes(
#                     name="Polity",
#                     description="Prelims + Mains"
#                 ),
#                 database_models.Notes(
#                     name="Economics",
#                     description="Prelims + Mains"
#                 ),
#                 database_models.Notes(
#                     name="History",
#                     description="Only Prelims"
#                 ),
#             ]

#             db.add_all(notes)
#             db.commit()
#     finally:
#         db.close()


# init_db()


@app.get("/notes")
def get_all_notes(db: Session = Depends(get_db)):
    notes = db.query(database_models.Notes).all()

    if not notes:
        return {"message": "No notes found"}

    return notes


@app.get("/notes/{id}", response_model=NoteResponse)
def get_note_by_id(id: int, db: Session = Depends(get_db)):
    note = db.query(database_models.Notes).filter(
        database_models.Notes.id == id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return note


@app.post("/notes", response_model=NoteResponse, status_code=201)
def add_note(note: NoteCreate, db: Session = Depends(get_db)):
    new_note = database_models.Notes(**note.model_dump())

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@app.put("/notes/{id}", response_model=NoteResponse)
def update_note(id: int, note: NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(database_models.Notes).filter(
        database_models.Notes.id == id
    ).first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    db_note.name = note.name
    db_note.description = note.description

    db.commit()
    db.refresh(db_note)

    return db_note


@app.delete("/notes/{id}")
def delete_note(id: int, db: Session = Depends(get_db)):
    db_note = db.query(database_models.Notes).filter(
        database_models.Notes.id == id
    ).first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(db_note)
    db.commit()

    return {"message": "Deleted Successfully"}