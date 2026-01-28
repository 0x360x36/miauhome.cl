from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    cat_name = Column(String, nullable=True)
    cat_breed = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    orders = relationship("Order", back_populates="user")
    configuration = relationship("UserConfiguration", uselist=False, back_populates="user")
    addresses = relationship("UserAddress", back_populates="user")
    cart = relationship("Cart", uselist=False, back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")

class UserConfiguration(Base):
    __tablename__ = "user_configurations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    receive_emails = Column(Boolean, default=True)
    language = Column(String, default="es")
    
    user = relationship("User", back_populates="configuration")

class UserAddress(Base):
    __tablename__ = "user_addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    address_line = Column(String)
    city = Column(String)
    region = Column(String)
    
    user = relationship("User", back_populates="addresses")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Integer)
    image_url = Column(String) # Main image
    category = Column(String) # 'cat_food', 'toys', etc.
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variations = relationship("ProductVariation", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    url = Column(String)

    product = relationship("Product", back_populates="images")

class ProductVariation(Base):
    __tablename__ = "product_variations"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String) # e.g. '3kg', '10kg' or 'Red', 'Blue'
    variation_type = Column(String, nullable=True) # e.g. 'color', 'size', 'shape'
    price = Column(Integer, nullable=True) # Optional override
    stock = Column(Integer, default=0)

    product = relationship("Product", back_populates="variations")

class Discount(Base):
    __tablename__ = "discounts"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    percentage = Column(Integer)
    valid_until = Column(DateTime)
    is_active = Column(Boolean, default=True)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    message = Column(String)
    status = Column(String, default="open") # open, closed, in_progress
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="support_tickets")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_amount = Column(Integer)
    status = Column(String, default="pending") # pending, paid, failed
    buy_order = Column(String, unique=True)
    session_id = Column(String)
    token_ws = Column(String, nullable=True) # For Webpay Plus
    payment_type = Column(String, default="webpay_plus")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    guest_email = Column(String, nullable=True)
    guest_address = Column(String, nullable=True)

    user = relationship("User", back_populates="orders")

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    variation_id = Column(Integer, ForeignKey("product_variations.id"), nullable=True)
    quantity = Column(Integer, default=1)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
    variation = relationship("ProductVariation")
