from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy import Column, Integer, String, Boolean, DateTime
import datetime

Base = declarative_base()

class Notes(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Nullable for Google OAuth users
    auth_provider = Column(String, default="local") # "local" or "google"
    avatar_url = Column(String, nullable=True)
    is_new_user = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)