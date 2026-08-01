from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database import models
from app.database.init_db import upgrade_db_schema

from app.routers import notes
from app.routers import evaluation
from app.routers import auth
from app.routers import subject_topics

app = FastAPI(
    title="BrainVault API"
)

# Auto-recreate missing tables & upgrade existing schema to include user_id and subject_topics
models.Base.metadata.create_all(bind=engine)
upgrade_db_schema()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router)
app.include_router(evaluation.router)
app.include_router(auth.router)
app.include_router(subject_topics.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to BrainVault API"
    }