import pandas as pd
import numpy as np
import requests
import os
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("INDIAN_API_KEY")
BASE_URL = "https://stock.indianapi.in/historical_data"

def fetch_historical_data(symbol):
    """
    Fetches historical data from IndianAPI.in
    We use '2yr' or '1yr' to ensure we have enough data points for the ML model.
    """
    # IndianAPI expects clean symbols like "RELIANCE" (usually without .NS, but we handle both)
    clean_symbol = symbol.replace(".NS", "").replace(".BO", "")
    
    params = {
        "stock_name": clean_symbol,
        "period": "1yr", # 1 year of daily data is good for trend prediction
        "filter": "default"
    }
    
    headers = {"X-Api-Key": API_KEY}

    try:
        response = requests.get(BASE_URL, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # PARSING LOGIC SPECIFIC TO INDIANAPI.IN
            # The API usually returns: {'datasets': [{'values': [[date, close, ...]]}]} 
            # or sometimes a flat list depending on the specific endpoint version.
            
            raw_data = []
            
            if "datasets" in data and len(data["datasets"]) > 0:
                # Structure: Date, Open, High, Low, Close, Volume (Standard format)
                # We need to verify if it's a list of lists or list of dicts.
                # Assuming list of lists: ['2023-01-01', 2500, 2550, 2490, 2520, 10000]
                values = data["datasets"][0].get("values", [])
                
                # Check if values exist
                if not values:
                    return None

                # Convert to DataFrame
                # We map columns based on standard OHLCV order from their docs
                df = pd.DataFrame(values)
                
                # Handle column naming dynamically
                if len(df.columns) >= 6:
                     df = df.iloc[:, :6] # Keep first 6 columns
                     df.columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
                elif len(df.columns) == 2:
                     # Sometimes API returns only Date, Close
                     df.columns = ['Date', 'Close']
                     # Mock H/L for robustness if missing
                     df['High'] = df['Close']
                     df['Low'] = df['Close']
                
                # Clean Data
                df['Close'] = pd.to_numeric(df['Close'], errors='coerce')
                df['High'] = pd.to_numeric(df['High'], errors='coerce')
                df['Low'] = pd.to_numeric(df['Low'], errors='coerce')
                
                return df.dropna()

            else:
                print(f"Structure mismatch for {symbol}: {data.keys()}")
                return None
        else:
            print(f"API Error {response.status_code}: {response.text}")
            return None

    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return None

def calculate_technical_indicators(df):
    """
    Adds RSI, EMA, and Volatility to the dataframe.
    """
    # Ensure we have enough data
    if len(df) < 21:
        return df

    # RSI (Relative Strength Index)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # EMA (Exponential Moving Average)
    df['EMA_9'] = df['Close'].ewm(span=9, adjust=False).mean()
    df['EMA_21'] = df['Close'].ewm(span=21, adjust=False).mean()
    
    # Volatility (ATR Proxy: High - Low)
    df['Volatility'] = df['High'] - df['Low']
    
    return df.dropna()

def predict_intraday(symbol):
    """
    Predicts the next likely price target and stop loss.
    """
    # 1. Get Real Data from IndianAPI
    df = fetch_historical_data(symbol)
    
    if df is None or len(df) < 30:
        return {
            "symbol": symbol,
            "error": "Insufficient data from IndianAPI. Check symbol or API Limit."
        }

    # 2. Add Indicators
    df = calculate_technical_indicators(df)
    
    if df.empty:
         return {"symbol": symbol, "error": "Not enough data for indicators."}

    # 3. Prepare for ML (Linear Regression)
    # We use previous Close, RSI, and EMA to predict the NEXT Close
    df['Target'] = df['Close'].shift(-1) # The value we want to predict
    data_for_ml = df.dropna()

    if len(data_for_ml) < 10:
        return {"symbol": symbol, "error": "Not enough training data."}

    features = ['Close', 'RSI', 'EMA_9', 'EMA_21', 'Volatility']
    X = data_for_ml[features]
    y = data_for_ml['Target']

    # Train Model
    model = LinearRegression()
    model.fit(X, y)

    # 4. Predict Next Move
    last_row = df.iloc[[-1]][features] # Get the very latest candle
    predicted_price = model.predict(last_row)[0]
    
    current_price = last_row['Close'].values[0]
    current_rsi = last_row['RSI'].values[0]

    # 5. Generate Logic-Based Signals
    atr = df['Volatility'].mean()
    
    # Logic: If Prediction is higher AND trend is up (EMA 9 > EMA 21) -> BUY
    signal = "HOLD"
    if predicted_price > current_price and current_rsi < 70:
        signal = "BUY"
        stop_loss = current_price - (atr * 1.5) 
        target = predicted_price + (atr * 1.0) 
    elif predicted_price < current_price or current_rsi > 70:
        signal = "SELL"
        stop_loss = current_price + (atr * 1.5)
        target = predicted_price - (atr * 1.0)
    else:
        signal = "NEUTRAL"
        stop_loss = current_price - atr
        target = current_price + atr

    return {
        "symbol": symbol.upper(),
        "current_price": round(float(current_price), 2),
        "signal": signal,
        "predicted_target": round(float(target), 2),
        "stop_loss": round(float(stop_loss), 2),
        "rsi": round(float(current_rsi), 2),
        "confidence": "High (IndianAPI Data)"
    }

def recommend_investment(user_profile):
    """
    Same investment logic as before.
    """
    risk = user_profile.risk_tolerance.lower()
    recommendations = []

    if risk == "low":
        recommendations = [
            {"type": "Fixed Deposit (FD)", "allocation": "50%", "reason": "Zero risk, guaranteed returns."},
            {"type": "Debt Mutual Funds", "allocation": "30%", "reason": "Better than savings account."},
            {"type": "Gold Bonds", "allocation": "20%", "reason": "Hedge against inflation."}
        ]
    elif risk == "moderate":
        recommendations = [
            {"type": "Nifty 50 Index Fund", "allocation": "40%", "reason": "Stable market growth."},
            {"type": "Flexi-cap Fund", "allocation": "30%", "reason": "Diversified equity exposure."},
            {"type": "Corporate Bonds", "allocation": "30%", "reason": "Fixed income stability."}
        ]
    else: # High
        recommendations = [
            {"type": "Mid-Cap Mutual Funds", "allocation": "40%", "reason": "High growth potential."},
            {"type": "Direct Stocks", "allocation": "30%", "reason": "Aggressive returns."},
            {"type": "Crypto / IPOs", "allocation": "30%", "reason": "High risk bets."}
        ]

    return recommendations