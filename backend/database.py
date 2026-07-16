from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

db_url = "postgresql://postgres:Ashutosh04%40%23@localhost:5432/brainvault"
engine = create_engine(db_url)
session = sessionmaker(autocommit = False, autoflush =False, bind= engine)