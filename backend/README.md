# Backend — BrainVault API

This folder contains the FastAPI backend used by the project.

## Purpose

- Provides endpoints to manage notes and to extract text from uploaded files (PDFs, images).

## Requirements

- Python 3.11+
- A running database reachable via `DATABASE_URL` environment variable (SQLite, Postgres, etc.).

## Configuration

- The backend reads configuration from a `.env` file (see `app/core/config.py`). Create a `.env` file in `backend/` with at least:

```
DATABASE_URL=sqlite:///./dev.db
```

## Run locally

Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings pypdf pillow python-multipart
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The app will expose interactive docs at `http://127.0.0.1:8000/docs` and `http://127.0.0.1:8000/redoc`.

## Important files

- `app/main.py` — application entrypoint and CORS settings.
- `app/routers/notes.py` — endpoints for `GET /notes` and `POST /notes`.
- `app/routers/evaluation.py` — `POST /evaluation/convert-file` for file uploads.
- `app/services/evaluation_service.py` — file parsing and OCR helper.

## API reference

See [backend/API.md](API.md) for endpoint examples and curl snippets.
