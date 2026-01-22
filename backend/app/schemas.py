from pydantic import BaseModel
from typing import Optional, List
import datetime

# Product Schema
class ProductBase(BaseModel):
    name: str
    description: str
    price: int
    image_url: str
    category: str
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

# Discount Schema
class DiscountBase(BaseModel):
    code: str
    percentage: int
    valid_until: datetime.datetime
    is_active: bool = True

class DiscountCreate(DiscountBase):
    pass

class Discount(DiscountBase):
    id: int
    class Config:
        orm_mode = True

# Support Ticket Schema
class SupportTicketBase(BaseModel):
    subject: str
    message: str

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicket(SupportTicketBase):
    id: int
    user_id: int
    status: str
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# User Configuration Schema
class UserConfigurationBase(BaseModel):
    receive_emails: bool = True
    language: str = "es"

class UserConfiguration(UserConfigurationBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# User Address Schema
class UserAddressBase(BaseModel):
    address_line: str
    city: str
    region: str

class UserAddress(UserAddressBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class UserAddressCreate(UserAddressBase):
    pass

# Order Schema
class Order(BaseModel):
    id: int
    total_amount: int
    status: str
    buy_order: str
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    total_amount: int

# User Schemas
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
    is_admin: bool = False
    configuration: Optional[UserConfiguration] = None
    addresses: List[UserAddress] = []
    orders: List[Order] = []
    support_tickets: List[SupportTicket] = []

    class Config:
        orm_mode = True

class GoogleLogin(BaseModel):
    token: str

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    product: Product

    class Config:
        orm_mode = True

class Cart(BaseModel):
    id: int
    items: List[CartItem] = []

    class Config:
        orm_mode = True
