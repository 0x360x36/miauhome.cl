from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
import uuid

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MiauHome API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
