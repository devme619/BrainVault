import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.database import engine
from app.database import models
from app.database.init_db import upgrade_db_schema

from app.routers import notes
from app.routers import evaluation
from app.routers import auth
from app.routers import subject_topics
from app.routers import s3_router

app = FastAPI(
    title="BrainVault API"
)

# Auto-recreate missing tables & upgrade existing schema
models.Base.metadata.create_all(bind=engine)
upgrade_db_schema()

# Static uploads mount for local fallback
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
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
app.include_router(s3_router.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to BrainVault API - Production Ready",
        "version": "1.0.0"
    }