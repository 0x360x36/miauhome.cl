from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, auth, database
from transbank.common.integration_type import IntegrationType
from transbank_logic import TransbankService
import uuid
import os
from typing import Optional, List

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MiauHome API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/cart", response_model=schemas.Cart)
def get_cart(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@app.post("/cart/items", response_model=schemas.Cart)
def add_to_cart(
    item_in: schemas.CartItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    # Check if item already exists
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == item_in.product_id,
        models.CartItem.variation_id == item_in.variation_id
    ).first()
    
    if cart_item:
        cart_item.quantity += item_in.quantity
    else:
        cart_item = models.CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            variation_id=item_in.variation_id,
            quantity=item_in.quantity
        )
        db.add(cart_item)
        
    db.commit()
    db.refresh(cart)
    return cart

@app.delete("/cart/items/{product_id}", response_model=schemas.Cart)
def remove_from_cart(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return cart

@app.on_event("startup")
def startup_event():
    db = next(database.get_db())
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=database.engine)
    
    # Create default admin if not exists
    if db.query(models.User).filter(models.User.email == "admin@miauhome.cl").count() == 0:
        admin_user = models.User(
            email="admin@miauhome.cl",
            hashed_password=auth.get_password_hash("admin123"),
            first_name="Admin",
            last_name="Miau",
            is_admin=True
        )
        db.add(admin_user)
        db.commit()

    if db.query(models.Product).count() == 0:
        # Seed products matching frontend data
        products_data = [
            {
                "name": 'Rascador Deluxe Premium', 
                "price": 45990, 
                "category": 'Muebles', 
                "image_url": 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800&auto=format&fit=crop', 
                "description": 'Rascador de 3 niveles con hamaca y juguetes colgantes.',
                "variations": [
                    {"name": "Gris Ártico", "stock": 5},
                    {"name": "Beige Arena", "stock": 3}
                ]
            },
            {
                "name": 'Fuente de Agua Inteligente', 
                "price": 32990, 
                "category": 'Alimentación', 
                "image_url": 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?q=80&w=800&auto=format&fit=crop', 
                "description": 'Agua fresca y filtrada 24/7 para tu michi. Silenciosa y fácil de limpiar.',
                "variations": [
                    {"name": "Blanco Minimal", "stock": 10},
                    {"name": "Azul Noche", "stock": 8}
                ]
            },
            {
                "name": 'Cama Iglú Acolchada', 
                "price": 24990, 
                "category": 'Descanso', 
                "image_url": 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop', 
                "description": 'Refugio suave y cálido, perfecto para los días fríos.',
                "variations": [
                    {"name": "Pequeña", "stock": 15},
                    {"name": "Mediana", "stock": 10},
                    {"name": "Grande", "stock": 5}
                ]
            },
            {
                "name": 'Juguete Láser Automático', 
                "price": 15990, 
                "category": 'Juguetes', 
                "image_url": 'https://images.unsplash.com/photo-1615802187760-b610c1f59247?q=80&w=800&auto=format&fit=crop', 
                "description": 'Horas de diversión garantizada con patrones aleatorios.',
                "variations": [
                    {"name": "Standard", "stock": 20}
                ]
            }
        ]
        
        for p_data in products_data:
            vars_data = p_data.pop("variations", [])
            db_product = models.Product(**p_data)
            db.add(db_product)
            db.commit()
            db.refresh(db_product)
            for v_data in vars_data:
                db_var = models.ProductVariation(**v_data, product_id=db_product.id)
                db.add(db_var)
        db.commit()

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password, 
        first_name=user.first_name,
        last_name=user.last_name,
        cat_name=user.cat_name,
        cat_breed=user.cat_breed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create address if provided
    if user.address:
        db_address = models.UserAddress(
            user_id=new_user.id,
            address_line=user.address,
            city=user.city or "Santiago",
            region=user.region or "Metropolitana"
        )
        db.add(db_address)
    
    # Create configuration
    config = models.UserConfiguration(user_id=new_user.id)
    db.add(config)
    
    # Create cart
    cart = models.Cart(user_id=new_user.id)
    db.add(cart)
    db.commit()
    
    return new_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/products", response_model=List[schemas.Product])
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).filter(models.Product.is_active == True).all()

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/checkout")
def checkout(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)
):
    try:
        buy_order = str(uuid.uuid4())[:26]
        session_id = str(uuid.uuid4())[:26]
        
        # Standard Webpay Plus
        return_url = "http://localhost:3000/checkout/result"
        print(f"Starting Webpay Plus for amount: {order_data.total_amount}")
        response = TransbankService.start_webpay_plus(buy_order, session_id, order_data.total_amount, return_url)
        print(f"Webpay response: {response}")
        
        new_order = models.Order(
            total_amount=order_data.total_amount,
            buy_order=buy_order,
            session_id=session_id,
            token_ws=response['token'],
            payment_type="webpay_plus",
            user_id=current_user.id if current_user else None,
            guest_email=order_data.guest_email if not current_user else None,
            guest_address=order_data.guest_address if not current_user else None
        )
        db.add(new_order)
        db.commit()
        print(f"Order created with ID: {new_order.id}")
        
        return {"url": response['url'], "token": response['token']}
    except Exception as e:
        print(f"Checkout error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/checkout/confirm")
def confirm_payment(token_ws: str, db: Session = Depends(database.get_db)):
    response = TransbankService.commit_webpay_plus(token_ws)
    
    order = db.query(models.Order).filter(models.Order.token_ws == token_ws).first()
    if order:
        if response['status'] == 'AUTHORIZED':
            order.status = "paid"
        else:
            order.status = "failed"
        db.commit()
    
    return response

# --- New Endpoints for Account Management ---

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me/configuration", response_model=schemas.UserConfiguration)
def update_user_configuration(
    config_in: schemas.UserConfigurationBase,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    config = db.query(models.UserConfiguration).filter(models.UserConfiguration.user_id == current_user.id).first()
    if not config:
        config = models.UserConfiguration(user_id=current_user.id, **config_in.dict())
        db.add(config)
    else:
        for key, value in config_in.dict().items():
            setattr(config, key, value)
            
    db.commit()
    db.refresh(config)
    return config

@app.post("/users/me/addresses", response_model=schemas.UserAddress)
def create_user_address(
    address_in: schemas.UserAddressCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    address = models.UserAddress(user_id=current_user.id, **address_in.dict())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

@app.get("/users/me/orders", response_model=List[schemas.Order])
def get_user_orders(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()

def check_admin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# Admin: Manage Products
@app.get("/orders", response_model=List[schemas.Order])
def get_all_orders(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@app.put("/orders/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

@app.get("/stats/summary")
def get_stats_summary(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    total_sales = db.query(models.Order).filter(models.Order.status == "paid").sum(models.Order.total_amount) or 0
    # Wait, sqlalchemy sum usage might be different
    from sqlalchemy import func
    total_sales = db.query(func.sum(models.Order.total_amount)).filter(models.Order.status == "paid").scalar() or 0
    order_count = db.query(models.Order).count()
    product_count = db.query(models.Product).count()
    user_count = db.query(models.User).count()
    
    return {
        "total_sales": total_sales,
        "order_count": order_count,
        "product_count": product_count,
        "user_count": user_count
    }

@app.post("/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    product_data = product.dict()
    variations_data = product_data.pop("variations", [])
    images_data = product_data.pop("images", [])
    db_product = models.Product(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    for var_data in variations_data:
        db_var = models.ProductVariation(**var_data, product_id=db_product.id)
        db.add(db_var)
    
    for img_data in images_data:
        db_img = models.ProductImage(**img_data, product_id=db_product.id)
        db.add(db_img)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = product.dict()
    variations_data = product_data.pop("variations", [])
    images_data = product_data.pop("images", [])
    
    for key, value in product_data.items():
        setattr(db_product, key, value)
    
    # Update variations
    db.query(models.ProductVariation).filter(models.ProductVariation.product_id == product_id).delete()
    for var_data in variations_data:
        db_var = models.ProductVariation(**var_data, product_id=product_id)
        db.add(db_var)
    
    # Update images
    db.query(models.ProductImage).filter(models.ProductImage.product_id == product_id).delete()
    for img_data in images_data:
        db_img = models.ProductImage(**img_data, product_id=product_id)
        db.add(db_img)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# Admin: Discounts
@app.post("/discounts", response_model=schemas.Discount)
def create_discount(
    discount: schemas.DiscountCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    db_discount = models.Discount(**discount.dict())
    db.add(db_discount)
    db.commit()
    db.refresh(db_discount)
    return db_discount

@app.get("/discounts", response_model=List[schemas.Discount])
def get_discounts(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    return db.query(models.Discount).all()

# Support Tickets
@app.post("/support", response_model=schemas.SupportTicket)
def create_ticket(
    ticket: schemas.SupportTicketCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_ticket = models.SupportTicket(**ticket.dict(), user_id=current_user.id)
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/support/me", response_model=List[schemas.SupportTicket])
def get_my_tickets(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.SupportTicket).filter(models.SupportTicket.user_id == current_user.id).all()

@app.get("/support/admin", response_model=List[schemas.SupportTicket])
def get_all_tickets(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(check_admin)
):
    return db.query(models.SupportTicket).all()

