from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.s3_service import upload_file_to_cloud

router = APIRouter(
    prefix="/s3",
    tags=["Cloud Storage"]
)

@router.post("/upload")
async def upload_file_to_s3(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
        
    contents = await file.read()
    res = upload_file_to_cloud(
        file_bytes=contents,
        filename=file.filename,
        content_type=file.content_type
    )
    return res
