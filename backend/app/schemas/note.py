from pydantic import BaseModel
from typing import Optional

class NoteCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_name: Optional[str] = None
    extracted_text: Optional[str] = None
    text_content: Optional[str] = None

class NoteResponse(NoteCreate):
    id: int
    user_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }