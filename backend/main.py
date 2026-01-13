from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth, crud
from database import get_db, engine
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import ai
import finance

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ai Finanace Assistant")

@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/transactions/", response_model=schemas.TransactionOut)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_transaction(db=db, transaction=transaction, user_id=current_user.id)

@app.get("/transactions/", response_model=List[schemas.TransactionOut])
def read_transactions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/assets/", response_model=schemas.AssetOut)
def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_asset(db=db, asset=asset, user_id=current_user.id)

@app.get("/assets/", response_model=List[schemas.AssetOut])
def read_assets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_assets(db, user_id=current_user.id)

@app.post("/chat/")
def chat_with_ai(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    transactions = crud.get_transactions(db, user_id=current_user.id, limit=10)
    assets = crud.get_assets(db, user_id=current_user.id)

    trans_text = "\n".join([f"{t.date.date()}: {t.type} ${t.amount} ({t.category})" for t in transactions]) if transactions else "No recent transactions."
    
    assets_text = "\n".join([f"{a.quantity} shares of {a.symbol} ({a.asset_type})" for a in assets]) if assets else "No assets in portfolio."
    
    user_profile = {
        "name": current_user.full_name or "User",
        "income": current_user.monthly_income,
        "risk": current_user.risk_tolerance
    }
    
    financial_data = {
        "transactions": trans_text,
        "assets": assets_text
    }

    try:
        ai_response = ai.ask_ai_advisor(user_profile, financial_data, request.question)
        return {"response": ai_response}
    except Exception as e:
        return {"error": str(e), "message": "Failed to contact Gemini API"}

@app.get("/portfolio/performance")
def get_portfolio_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Get user assets
    assets = crud.get_assets(db, user_id=current_user.id)
    
    if not assets:
        return {"message": "No assets found", "total_value": 0}

    # 2. Extract symbols (e.g., ["AAPL", "BTC-USD"])
    symbols = [asset.symbol for asset in assets]
    
    # 3. Fetch Live Prices
    live_prices = finance.get_live_prices(symbols)
    
    # 4. Calculate Values
    portfolio = []
    total_value = 0.0
    
    for asset in assets:
        current_price = live_prices.get(asset.symbol, 0.0)
        current_value = current_price * asset.quantity
        profit_loss = current_value - (asset.buy_price * asset.quantity)
        
        asset_data = {
            "symbol": asset.symbol,
            "quantity": asset.quantity,
            "buy_price": asset.buy_price,
            "current_price": current_price,
            "total_value": round(current_value, 2),
            "profit_loss": round(profit_loss, 2)
        }
        portfolio.append(asset_data)
        total_value += current_value

    return {
        "total_portfolio_value": round(total_value, 2),
        "holdings": portfolio
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Finance Assistant API!"}