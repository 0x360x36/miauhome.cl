from pydantic import BaseModel
from typing import Optional, List
import datetime

# Product Schema
class ProductImageBase(BaseModel):
    url: str

class ProductImageCreate(ProductImageBase):
    pass

class ProductImage(ProductImageBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductVariationBase(BaseModel):
    name: str
    variation_type: Optional[str] = None
    price: Optional[int] = None
    stock: int = 0

class ProductVariationCreate(ProductVariationBase):
    pass

class ProductVariation(ProductVariationBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: int
    image_url: str
    category: str
    stock: int = 0
    is_active: bool = True

class ProductCreate(ProductBase):
    variations: List[ProductVariationCreate] = []
    images: List[ProductImageCreate] = []

class Product(ProductBase):
    id: int
    variations: List[ProductVariation] = []
    images: List[ProductImage] = []

    class Config:
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

# User Configuration Schema
class UserConfigurationBase(BaseModel):
    receive_emails: bool = True
    language: str = "es"

class UserConfiguration(UserConfigurationBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# User Address Schema
class UserAddressBase(BaseModel):
    address_line: str
    city: str
    region: str

class UserAddress(UserAddressBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class UserAddressCreate(UserAddressBase):
    pass

# Order Schema
class Order(BaseModel):
    id: int
    total_amount: int
    status: str
    buy_order: str
    payment_type: str
    created_at: datetime.datetime
    guest_email: Optional[str] = None
    guest_address: Optional[str] = None
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    total_amount: int
    guest_email: Optional[str] = None
    guest_address: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

# User Schemas
class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    cat_name: Optional[str] = None
    cat_breed: Optional[str] = None

class UserCreate(UserBase):
    password: str
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None

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
        from_attributes = True

class CartItemBase(BaseModel):
    product_id: int
    variation_id: Optional[int] = None
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    product: Product
    variation: Optional[ProductVariation] = None

    class Config:
        from_attributes = True

class Cart(BaseModel):
    id: int
    items: List[CartItem] = []

    class Config:
        from_attributes = True
