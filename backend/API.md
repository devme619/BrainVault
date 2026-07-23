# Backend API

Base URL: `http://localhost:8000`

## Notes

- GET /notes/
  - Description: List all notes.
  - Example:

```bash
curl http://localhost:8000/notes/
```

- POST /notes/
  - Description: Create a note.
  - Request body (JSON):

```json
{
  "name": "Note title",
  "description": "Note body"
}
```

  - Example:

```bash
curl -X POST http://localhost:8000/notes/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample","description":"Hello"}'
```

## Evaluation (file conversion / OCR)

- POST /evaluation/convert-file
  - Description: Accepts a file upload (PDF or image) and returns extracted text and metadata.
  - Form field: `file` (multipart/form-data)
  - Example (curl):

```bash
curl -X POST http://localhost:8000/evaluation/convert-file \
  -F "file=@/path/to/document.pdf"
```

  - Response (example):

```json
{
  "filename": "document.pdf",
  "file_type": "application/pdf",
  "extracted_text": "--- Page 1 ---\n...",
  "word_count": 123,
  "character_count": 7890,
  "pages_processed": 3,
  "status": "success"
}
```

Notes: OCR for images uses `pytesseract` — the Tesseract binary must be installed and available on the server for OCR to work.
