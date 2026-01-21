from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
import uuid
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MiauHome API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")

@app.post("/auth/google")
def google_login(login_data: schemas.GoogleLogin, db: Session = Depends(database.get_db)):
    try:
        # Verify the token
        id_info = id_token.verify_oauth2_token(
            login_data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        # Get user info
        email = id_info['email']
        google_id = id_info['sub']
        name = id_info.get('name', '')
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create new user
            user = models.User(
                email=email,
                full_name=name,
                google_id=google_id,
                is_active=True,
                hashed_password=auth.get_password_hash(str(uuid.uuid4())) # Random password for google users
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create a cart for the new user
            cart = models.Cart(user_id=user.id)
            db.add(cart)
            db.commit()
        elif not user.google_id:
            # Link existing user
            user.google_id = google_id
            db.commit()
            
            # Check if user has a cart
            cart = db.query(models.Cart).filter(models.Cart.user_id == user.id).first()
            if not cart:
                cart = models.Cart(user_id=user.id)
                db.add(cart)
                db.commit()
                
        # Create access token
        access_token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user": user}
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

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
        models.CartItem.product_id == item_in.product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += item_in.quantity
    else:
        cart_item = models.CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
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
    if db.query(models.Product).count() == 0:
        # Seed products matching frontend data
        products = [
            models.Product(name='Rascador Deluxe Premium', price=45990, category='Muebles', image_url='https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800&auto=format&fit=crop', description='Rascador de 3 niveles con hamaca y juguetes colgantes.'),
            models.Product(name='Fuente de Agua Inteligente', price=32990, category='Alimentación', image_url='https://images.unsplash.com/photo-1571566882372-1598d88abd90?q=80&w=800&auto=format&fit=crop', description='Agua fresca y filtrada 24/7 para tu michi. Silenciosa y fácil de limpiar.'),
            models.Product(name='Cama Iglú Acolchada', price=24990, category='Descanso', image_url='https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop', description='Refugio suave y cálido, perfecto para los días fríos.'),
            models.Product(name='Juguete Láser Automático', price=15990, category='Juguetes', image_url='https://images.unsplash.com/photo-1615802187760-b610c1f59247?q=80&w=800&auto=format&fit=crop', description='Horas de diversión garantizada con patrones aleatorios.'),
            models.Product(name='Mochila Transportadora Espacial', price=38990, category='Transporte', image_url='https://images.unsplash.com/photo-1598284693774-7049405d4546?q=80&w=800&auto=format&fit=crop', description='Lleva a tu gato a todas partes con estilo y seguridad.'),
            models.Product(name='Pack Paté Gourmet x12', price=12990, category='Alimentación', image_url='https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop', description='Sabores surtidos: Salmón, Atún, Pollo y Pavo.')
        ]
        db.add_all(products)
        db.commit()

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/products", response_model=list[schemas.Product])
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).all()

@app.post("/checkout")
def checkout(order_data: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    buy_order = str(uuid.uuid4())[:26]
    session_id = str(uuid.uuid4())[:26]
    
    # Integración Transbank
    tx = Transaction()
    return_url = "http://localhost:3000/checkout/result"
    
    response = tx.create(buy_order, session_id, order_data.total_amount, return_url)
    
    new_order = models.Order(
        total_amount=order_data.total_amount,
        buy_order=buy_order,
        session_id=session_id,
        token_ws=response['token']
    )
    db.add(new_order)
    db.commit()
    
    return {"url": response['url'], "token": response['token']}

@app.get("/checkout/confirm")
def confirm_payment(token_ws: str, db: Session = Depends(database.get_db)):
    tx = Transaction()
    response = tx.commit(token_ws)
    
    order = db.query(models.Order).filter(models.Order.token_ws == token_ws).first()
    if order:
        if response['status'] == 'AUTHORIZED':
            order.status = "paid"
        else:
            order.status = "failed"
        db.commit()
    
    return response
