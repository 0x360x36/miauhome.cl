from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: int
    image_url: str
    category: str

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    total_amount: int

class Order(BaseModel):
    id: int
    total_amount: int
    status: str
    buy_order: str

    class Config:
        orm_mode = True
