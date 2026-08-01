from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.evaluation_service import extract_text_from_file
from app.services.llm_service import evaluate_llm_answer, organize_note_text

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)

class OrganizeTextRequest(BaseModel):
    extracted_text: str
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None


@router.post("/convert-file")
async def convert_file(
    file: UploadFile = File(...),
    provider: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    model_name: Optional[str] = Form(None)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    contents = await file.read()
    result = extract_text_from_file(contents, file.filename, file.content_type)
    
    if provider and result.get("extracted_text"):
        ai_eval = evaluate_llm_answer(
            extracted_text=result["extracted_text"],
            provider=provider,
            api_key=api_key or "",
            model_name=model_name or ""
        )
        result["evaluation_report"] = ai_eval

    return result


@router.post("/organize-text")
def organize_text(payload: OrganizeTextRequest):
    if not payload.extracted_text or not payload.extracted_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty.")

    res = organize_note_text(
        extracted_text=payload.extracted_text,
        provider=payload.provider,
        api_key=payload.api_key,
        model_name=payload.model_name
    )
    return res