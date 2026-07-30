# 🧠 BrainVault (AIR1) — AI-Powered UPSC Mains Evaluation & Note Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

---

## 🎯 Problem Statement & Vision

Preparing for the **UPSC Civil Services Examination (CSE)** requires rigorous note-taking, structured answer writing, and immediate, actionable feedback on Mains answer sheets. 

### Key Challenges UPSC Aspirants Face:
1. **Slow & Subjective Answer Evaluation**: Waiting days or weeks for manual evaluation of practice answer sheets.
2. **Missing Essential Terminology**: Difficulty identifying missed GS keywords, constitutional articles, committee names, and government schemes.
3. **Fragmented Notes & Media**: Managing separate handwritten notes, uploaded PDFs, images, and text documents across multiple platforms.
4. **Lack of Instant Structural Guidance**: Uncertainty about whether Introduction, Body, and Conclusion sections meet UPSC evaluation standards.

### The BrainVault Solution:
**BrainVault (AIR1)** is an all-in-one AI platform engineered specifically for UPSC CSE aspirants. It combines **multi-provider LLM answer evaluation**, **high-precision OCR text extraction**, **Google Docs-style rich text note editing**, and **enterprise-grade PostgreSQL security** into a single, glassmorphic dark-mode workspace.

---

## ✨ Key Features

### 🤖 Multi-Provider AI Answer Sheet Evaluation
- **Flexible LLM Integration**: Bring your own free API Key to evaluate answer sheets using:
  - **Google Gemini**: `gemini-1.5-flash` (Recommended Free Tier), `gemini-1.5-pro`
  - **xAI Grok**: `grok-beta`, `grok-2`
  - **OpenRouter (Free LLMs)**: `google/gemini-flash-1.5:free`, `meta-llama/llama-3.1-8b-instruct:free`, `qwen/qwen-2.5-7b-instruct:free`
- **Comprehensive UPSC Scorecard**:
  - **Score & Grade**: Objective score out of 15 marks mapped to standard UPSC grading scales.
  - **Structural Assessment**: Detailed feedback on Introduction, Body content, and Conclusion.
  - **Strengths & Weaknesses**: Highlighted key strengths and areas needing improvement.
  - **Keyword Analytics**: Comparison of covered UPSC keywords vs. recommended missing terminology.
  - **Mentor Action Plan**: Actionable steps to elevate answers to 12+ marks.
- **Background Execution**: Evaluation runs asynchronously in Redux background—switch tabs freely without losing progress!

### ⚡ High-Precision OCR & PDF Text Extraction
- Convert multi-page PDF answer sheets or handwritten image documents into clean, searchable plain text using **Tesseract OCR** and **PyPDF**.
- Transcribed text includes word count metrics, character count, and one-click copy functionality.

### 📝 Google Docs-Style Interactive Note Workspace
- **Smart Note Modes**:
  - **Notes with Files**: Displays document preview (PDF/Image) with on-demand OCR text extraction.
  - **Notes without Files**: Opens a full-screen **Google Docs-Style Rich Text Editor** featuring:
    - **Formatting Toolbar**: Bold, Italic, Underline, Strikethrough, Headings (H1/H2/H3/Paragraph), Bullet Lists, Numbered Lists, Alignment, and Quote Blocks.
    - **Paper Canvas Layout**: Clean paper layout with margin styling.
    - **Live Metrics**: Real-time Word Count, Character Count, and Reading Time.
    - **Tab Switch Persistence**: State persisted in Redux so open notes remain active when switching tabs.

### 🔒 User Authentication & Security
- **PostgreSQL Database**: Persistent storage for user accounts and notes.
- **Direct Password Hashing**: Native `bcrypt` salt rounds (Python 3.14 compatible).
- **JWT Authorization**: JSON Web Tokens for stateless API security.
- **Google OAuth Integration**: Interactive popup modal dialog for Google Account sign-in.
- **Welcome Experience**: Animated splash screen celebrating new aspirants on registration.

---

## 🛠️ Tech Stack & Tools

| Component | Technologies & Tools Used |
| :--- | :--- |
| **Frontend Core** | React.js (v18+), React Router v6, Redux Toolkit (`@reduxjs/toolkit`) |
| **Styling & UI** | Tailwind CSS, Glassmorphic Backdrop Blur, Google Fonts (Inter / Outfit), Custom Animations |
| **Backend API** | FastAPI (Asynchronous Python 3.14 Framework), Uvicorn ASGI Server, Pydantic v2 |
| **Database & ORM** | PostgreSQL 16+, SQLAlchemy ORM |
| **Security & Auth** | Native `bcrypt` Hashing, PyJWT (JSON Web Tokens), CORS Middleware |
| **AI Evaluation APIs** | Google Gemini REST API, xAI Grok REST API, OpenRouter API |
| **OCR & Media Engines** | Tesseract OCR Engine (`pytesseract`), PyPDF, Pillow (`PIL`), `python-multipart` |
| **Developer Tools** | Git, PowerShell, Python Virtual Environment (`venv`), npm |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.11+ (Python 3.14 recommended)
- **Node.js**: 16+ & `npm`
- **PostgreSQL**: 14+ installed and running locally on port `5432`

---

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Activate Python virtual environment (Windows)
.\myenv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
> The backend server will be running at `http://127.0.0.1:8000`. API Documentation is available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start React development server
npm start
```
> The React app will open automatically in your browser at `http://localhost:3000`.

---

## 📂 Project Architecture & Directory Layout

```
AIR1/
├── backend/
│   ├── app/
│   │   ├── core/           # Security & Password Hashing (bcrypt, JWT)
│   │   ├── database/       # SQLAlchemy models & PostgreSQL connection
│   │   ├── routers/        # API Routers (auth, notes, evaluation)
│   │   ├── services/       # Multi-LLM Service (Gemini, Grok, OpenRouter) & OCR
│   │   └── main.py         # FastAPI application entrypoint & CORS config
│   └── myenv/              # Python virtual environment
├── frontend/
│   ├── public/             # Static assets & index.html
│   └── src/
│       ├── apis/           # Axios / fetch wrappers for backend endpoints
│       ├── components/     # React UI components (Auth, Header, Notes, CheckAnswers)
│       ├── hooks/          # Custom React Hooks
│       ├── utils/          # Redux Store (`appStore.js`, `notesSlice`, `checkAnswersSlice`)
│       └── App.js          # App router layout
└── README.md
```

---

## 📜 License & Acknowledgments

Built for UPSC aspirants striving for **AIR 1**. Empowering student preparation through artificial intelligence and intelligent design.
