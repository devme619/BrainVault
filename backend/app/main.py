from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database import models

from app.routers import notes
from app.routers import evaluation

app = FastAPI(
    title="BrainVault API"
)

models.Base.metadata.create_all(bind=engine)

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


app.include_router(notes.router)
app.include_router(evaluation.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to BrainVault"
    }