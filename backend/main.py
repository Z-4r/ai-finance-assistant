from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth, crud
from database import get_db, engine
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import ai
import finance
import ml_engine
import recommendation_engine
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ai Finanace Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", ""],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/chat")
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


@app.post("/predict/intraday")
def predict_stock(
    request: schemas.PredictionRequest, # <--- Must use the schema from Step 1
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Debugging: Print to console to see if request arrives
    print(f"Received Request -> Symbol: {request.symbol}, Period: {request.period}")
    
    try:
        # Pass both arguments to the engine
        prediction = ml_engine.predict_intraday(request.symbol, request.period)
        return prediction
    except Exception as e:
        print(f"Error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/portfolio")
def recommend_portfolio(
    request: schemas.InvestmentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Temporary profile object
    class TempProfile:
        risk_tolerance = request.risk_appetite
    
    profile = TempProfile()
    
    try:
        # Pass the new fields: target_amount and time_horizon_years
        portfolio = recommendation_engine.generate_portfolio(
            profile, 
            request.investable_amount,
            request.target_amount,
            request.time_horizon_years
        )
        return portfolio
    except Exception as e:
        return {"error": str(e)}
    
@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Find the asset
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id, models.Asset.user_id == current_user.id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}
    
@app.put("/assets/{asset_id}")
def update_asset(
    asset_id: int,
    asset_update: schemas.AssetCreate, # Re-using AssetCreate schema since fields are same
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Find the asset
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id, models.Asset.user_id == current_user.id).first()
    
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # 2. Update fields
    db_asset.symbol = asset_update.symbol
    db_asset.quantity = asset_update.quantity
    db_asset.buy_price = asset_update.buy_price
    db_asset.asset_type = asset_update.asset_type
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

# --- 1. SHARED HELPER FUNCTION (No 'Depends' here!) ---
def calculate_portfolio_summary(assets):
    """
    Accepts a list of asset objects.
    Fetches live prices and calculates totals + individual asset performance.
    """
    total_invested = 0.0
    total_current_value = 0.0
    
    # 1. Get Live Prices (Batch fetch is better)
    symbols = [asset.symbol for asset in assets]
    
    # Check if 'finance' module is imported and works, otherwise empty dict
    # Assuming you have: import finance
    live_prices = {}
    if symbols:
        try:
            live_prices = finance.get_live_prices(symbols)
        except Exception as e:
            print(f"Error fetching prices: {e}")
            live_prices = {}

    processed_assets = []

    # 2. Iterate to Calculate
    for asset in assets:
        # Get Price (Use live price, fallback to buy_price if missing)
        current_price = live_prices.get(asset.symbol, asset.buy_price)
        
        # Calculate Individual Stats
        invested = asset.quantity * asset.buy_price
        current_val = asset.quantity * current_price
        
        # Add to Globals
        total_invested += invested
        total_current_value += current_val
        
        # Add to List (for Portfolio Page)
        processed_assets.append({
            "id": asset.id,
            "symbol": asset.symbol,
            "quantity": asset.quantity,
            "buy_price": asset.buy_price,
            "current_price": current_price,
            "total_value": current_val,
            "profit_loss": current_val - invested
        })

    # 3. Calculate Final Globals
    total_profit = total_current_value - total_invested
    
    profit_percent = 0.0
    if total_invested > 0:
        profit_percent = (total_profit / total_invested) * 100

    return {
        "invested": total_invested,
        "current_value": total_current_value,
        "profit": total_profit,
        "profit_percent": profit_percent,
        "holdings": processed_assets # returning the list here saves work later
    }


# --- 2. PORTFOLIO ENDPOINT ---
@app.get("/portfolio/performance")
def get_portfolio_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Get Assets
    assets = crud.get_assets(db, user_id=current_user.id)
    
    if not assets:
        return {"total_portfolio_value": 0, "holdings": []}
    
    # 2. Use Helper
    stats = calculate_portfolio_summary(assets)

    # 3. Return formatted response
    # The helper already did the hard work of building the 'holdings' list
    return {
        "total_portfolio_value": round(stats["current_value"], 2),
        "total_profit": round(stats["profit"], 2),
        "profit_percent": round(stats["profit_percent"], 2),
        "holdings": stats["holdings"] 
    }


# --- 3. DASHBOARD ENDPOINT ---
@app.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Fetch Assets
    assets = crud.get_assets(db, user_id=current_user.id)

    # 2. Use Helper
    stats = calculate_portfolio_summary(assets)

    # 3. Activity Count (Predictions)
    active_count = db.query(models.Prediction).filter(
        models.Prediction.user_id == current_user.id
    ).count()

    # 4. Return Data
    return {
        "user_name": current_user.full_name if current_user.full_name else current_user.email,
        "portfolio_value": stats["current_value"],
        "total_profit": stats["profit"],
        "profit_percent": stats["profit_percent"],
        "active_count": active_count,
        "chart_data": [
            {"name": "Invested", "value": stats["invested"]}, 
            {"name": "Current Value", "value": stats["current_value"]}
        ]
    }
@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Finance Assistant API!"}