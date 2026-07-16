from fastapi import FastAPI
from models import Product

app  = FastAPI()

@app.get("/")

def greet():
    return "Welcome to BrainVault"

products = [
    Product(1, "phone", "budget phone", 99, 10),
    Product(2, "laptop", "gaming laptop", 999, 6)
]

@app.get("/products")

def get_all_products():
    return "all Products"