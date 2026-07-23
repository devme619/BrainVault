from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.evaluation_service import extract_text_from_file

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)

@router.post("/convert-file")
async def convert_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    contents = await file.read()
    result = extract_text_from_file(contents, file.filename, file.content_type)
    return result