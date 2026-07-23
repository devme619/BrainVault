# BrainVault (AIR1)

Simple full-stack project combining a FastAPI backend and a React frontend.

## Overview
- Backend: FastAPI project located in `backend/app` that exposes a small REST API for notes and a file-evaluation endpoint (OCR / PDF text extraction).
- Frontend: React app located in `frontend/` (Create React App + Tailwind CSS).

## Repo layout

- `backend/` — FastAPI application
- `frontend/` — React frontend (CRA)
- `myenv/` — an example Python virtual environment included in the workspace (optional)

## Quick start

Prerequisites: Python 3.11+ (or the same interpreter used to create `myenv`), Node.js 16+ and npm.

Backend (recommended):

Windows PowerShell

```powershell
cd backend
# create a venv if you don't have one
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
# install runtime dependencies (example)
pip install fastapi uvicorn sqlalchemy pypdf pillow python-multipart pydantic pydantic-settings
# set environment variables or create a .env with DATABASE_URL
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm start
```

The frontend expects the backend to be available at `http://localhost:8000` (CORS is configured for localhost:3000 and 5173 in `backend/app/main.py`).

## Next steps
- See [backend/README.md](backend/README.md) for backend setup and API details.
- See [backend/API.md](backend/API.md) for endpoint examples and curl snippets.
- See [frontend/README.md](frontend/README.md) for frontend notes.
