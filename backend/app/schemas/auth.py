from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserSignUp(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthInput(BaseModel):
    email: str
    full_name: str
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    auth_provider: str
    avatar_url: Optional[str] = None
    is_new_user: bool
    created_at: Optional[datetime.datetime] = None

    model_config = {
        "from_attributes": True
    }

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse
