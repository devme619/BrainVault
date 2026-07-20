from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class Notes(Base):

    __tablename__ = "notes"

    id= Column(Integer, primary_key=True, index= True)
    name=  Column(String)
    description =  Column(String)