from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:Ashutosh04%40%23@localhost:5432/brainvault"
    
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_ENDPOINT_URL: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None
    R2_PUBLIC_DOMAIN: Optional[str] = None
    PUBLIC_API_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_file_encoding="utf-8"
    )

settings = Settings()