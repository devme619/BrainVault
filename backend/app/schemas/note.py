from pydantic import BaseModel

class NoteCreate(BaseModel):
    name: str
    description: str

class NoteResponse(NoteCreate):
    id: int

    model_config = {
        "from_attributes": True
    }