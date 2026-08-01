from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubjectTopicCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class SubjectTopicUpdate(BaseModel):
    name: str

class SubjectTopicResponse(BaseModel):
    id: int
    user_id: int
    parent_id: Optional[int] = None
    name: str
    created_at: Optional[datetime] = None
    children: List["SubjectTopicResponse"] = []

    model_config = {
        "from_attributes": True
    }
