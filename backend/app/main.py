from fastapi import Depends,FastAPI
from app.models import Product
from app.database import session
import app.database_models as database_models
from app.database import engine
from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware


origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]



app  = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind =engine)


@app.get("/")

def greet():
    return "Welcome to BrainVault"

products = [
    Product(id= 1, name= "phone", description= "budget phone",price=  99,quantity=  10),
    Product(id= 2, name= "laptop", description= "gaming laptop",price=  999,quantity=  6),
    Product(id= 3, name= "watch", description= "smart watch",price=  200,quantity=  16),

]

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

def init_db():
    db = session()

    count = db.query(database_models.Product).count
    if count==0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))

    db.commit()

init_db()

@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_products = db.query(database_models.Product).all()
    return db_products

@app.get("/product/{id}")
def get_product_by_id(id:int, db:Session=Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id==id).first()
    if db_product:
            return db_product
    return "Product not found"

@app.post("/product")
def add_product(product: Product,  db:Session=Depends(get_db)):
    db.add(database_models.Product(**product.model_dump()))
    db.commit()
    return product

@app.put("/product")
def update_product(id:int, product:Product, db:Session=Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id==id).first()
    if db_product:
        db_product.name = product.name
        db_product.description = product.description
        db_product.price = product.price
        db_product.quantity = product.quantity
        db.commit()
        return "Product Updated"
    else:    
        return "No product found"

@app.delete("/product")
def delete_product(id:int,db:Session=Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id==id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return "Deleted Successfully"
    else:
        return "Product not found"