from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
session = sessionmaker(autocommit = False, autoflush =False, bind= engine)