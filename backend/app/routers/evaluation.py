from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.evaluation_service import extract_text_from_file
from app.services.llm_service import evaluate_llm_answer

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)

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
    
    # If user provided API Key and provider, evaluate answer sheet using chosen AI model
    if provider and api_key and result.get("extracted_text"):
        ai_eval = evaluate_llm_answer(
            extracted_text=result["extracted_text"],
            provider=provider,
            api_key=api_key,
            model_name=model_name
        )
        result["evaluation_report"] = ai_eval

    return result