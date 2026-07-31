from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

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

    notes = relationship("Notes", back_populates="user", cascade="all, delete-orphan")


class Notes(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    extracted_text = Column(String, nullable=True)
    text_content = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notes")