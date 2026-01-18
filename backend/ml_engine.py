
import pandas as pd
import numpy as np
import requests
import os
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_KEY = os.getenv("INDIAN_API_KEY")
if not API_KEY:
    raise ValueError("INDIAN_API_KEY not found in environment variables. Please set it in your .env file.")

BASE_URL = "https://stock.indianapi.in"

def fetch_company_fundamentals(symbol):
    """
    Fetches fundamental data (Analyst Ratings, Industry, P/E) to validate trades.
    Hedge funds don't just trade lines; they trade companies.
    """
    clean_symbol = symbol.replace(".NS", "").replace(".BO", "")
    
    # Endpoint: /stock (Get Company Data by Name)
    url = f"{BASE_URL}/stock"
    params = {"name": clean_symbol}
    headers = {"X-Api-Key": API_KEY}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            logger.warning(f"Fundamentals API returned status {response.status_code} for {symbol}")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Fundamental Data Error for {symbol}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching fundamentals for {symbol}: {e}")
        return None

def fetch_historical_data(symbol, period="1yr"):
    """
    Fetches 1 Year of data safely and slices it locally.
    """
    clean_symbol = symbol.replace(".NS", "").replace(".BO", "")
    
    # Always fetch 1yr to ensure technical indicators (EMA, RSI) have enough data
    url = f"{BASE_URL}/historical_data"
    params = {
        "stock_name": clean_symbol,
        "period": "1yr", 
        "filter": "default"
    }
    headers = {"X-Api-Key": API_KEY}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "datasets" in data and len(data["datasets"]) > 0:
                values = data["datasets"][0].get("values", [])
                if not values:
                    logger.warning(f"No data values returned for {symbol}")
                    return None

                df = pd.DataFrame(values)
                
                # Robust Column Mapping
                if len(df.columns) >= 6:
                    df = df.iloc[:, :6]
                    df.columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
                elif len(df.columns) == 2:
                    df.columns = ['Date', 'Close']
                    df['High'] = df['Close']
                    df['Low'] = df['Close']
                elif len(df.columns) >= 5:
                    # Handle 5-column case (possibly missing Volume)
                    df = df.iloc[:, :5]
                    df.columns = ['Date', 'Open', 'High', 'Low', 'Close']
                else:
                    logger.error(f"Unexpected column count ({len(df.columns)}) for {symbol}")
                    return None
                
                # Convert to numeric
                for col in ['Close', 'High', 'Low']:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors='coerce')
                
                df = df.dropna()
                
                if len(df) == 0:
                    logger.warning(f"All data was NaN for {symbol}")
                    return None

                # Slice Data Locally based on User Period
                period_map = {"1mo": 22, "3mo": 66, "6mo": 132, "1yr": 252, "7d": 7}
                rows_to_keep = period_map.get(period, 252)
                
                if len(df) > rows_to_keep:
                    df = df.tail(rows_to_keep)
                    
                return df
            else:
                logger.warning(f"No datasets found for {symbol}")
                return None
        else:
            logger.warning(f"Historical API returned status {response.status_code} for {symbol}")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Historical Data Request Error for {symbol}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching historical data for {symbol}: {e}")
        return None

def calculate_technical_indicators(df):
    """
    Calculates RSI, EMA, and Volatility.
    """
    # 1. Volatility (High - Low)
    if 'High' in df.columns and 'Low' in df.columns:
        df['Volatility'] = df['High'] - df['Low']
    else:
        df['Volatility'] = df['Close'] * 0.01  # Fallback: 1% of close
    
    # 2. RSI
    if len(df) >= 14:
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        
        # Prevent division by zero
        loss = loss.replace(0, 0.001)
        
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
    else:
        df['RSI'] = 50  # Neutral if insufficient data

    # 3. EMAs
    if len(df) >= 9:
        df['EMA_9'] = df['Close'].ewm(span=9, adjust=False).mean()
    else:
        df['EMA_9'] = df['Close']

    if len(df) >= 21:
        df['EMA_21'] = df['Close'].ewm(span=21, adjust=False).mean()
    else:
        df['EMA_21'] = df['Close']

    return df.dropna()

def analyze_fundamentals(fundamentals):
    """
    Analyzes fundamental data and returns analyst score.
    Returns: (analyst_score, analyst_sentiment)
    """
    analyst_score = 0  # -1 (Bearish) to +1 (Bullish)
    analyst_sentiment = "NEUTRAL"
    
    if not fundamentals:
        return analyst_score, analyst_sentiment
    
    # Parse Analyst Recommendations
    if "recosBar" in fundamentals:
        recos = fundamentals["recosBar"]
        
        try:
            if isinstance(recos, dict):
                # Count buy vs sell signals
                buy_signals = recos.get('buy', 0) + recos.get('strongBuy', 0)
                sell_signals = recos.get('sell', 0) + recos.get('strongSell', 0)
                hold_signals = recos.get('hold', 0)
                
                total_signals = buy_signals + sell_signals + hold_signals
                
                if total_signals > 0:
                    if buy_signals > sell_signals * 2:
                        analyst_score += 1
                        analyst_sentiment = "BULLISH"
                    elif sell_signals > buy_signals * 2:
                        analyst_score -= 1
                        analyst_sentiment = "BEARISH"
            elif isinstance(recos, list):
                # Handle list format if API returns it that way
                buy_count = sum(1 for r in recos if 'buy' in str(r).lower())
                sell_count = sum(1 for r in recos if 'sell' in str(r).lower())
                
                if buy_count > sell_count * 2:
                    analyst_score += 1
                    analyst_sentiment = "BULLISH"
                elif sell_count > buy_count * 2:
                    analyst_score -= 1
                    analyst_sentiment = "BEARISH"
        except (KeyError, TypeError, AttributeError) as e:
            logger.warning(f"Could not parse recosBar: {e}")
    
    # Check daily momentum
    if "percentChange" in fundamentals:
        try:
            pct_change = float(fundamentals["percentChange"])
            if pct_change > 2.0:
                analyst_score += 0.5
            elif pct_change < -2.0:
                analyst_score -= 0.5
        except (ValueError, TypeError):
            pass
    
    return analyst_score, analyst_sentiment

def predict_intraday(symbol, period="1yr"):
    """
    Main prediction function combining technical and fundamental analysis.
    """
    # 1. Fetch Technical Data (Price History)
    df = fetch_historical_data(symbol, period)
    
    # 2. Fetch Fundamental Data (Analyst Ratings)
    fundamentals = fetch_company_fundamentals(symbol)
    
    # --- SAFETY CHECKS ---
    if df is None or len(df) < 5:
        return {"symbol": symbol, "error": f"Insufficient price data for {period}."}

    # --- TECHNICAL ANALYSIS (The Quant Model) ---
    df = calculate_technical_indicators(df)
    
    features = [f for f in ['Close', 'RSI', 'EMA_9', 'EMA_21', 'Volatility'] if f in df.columns]
    
    if not features:
        return {"symbol": symbol, "error": "Could not calculate indicators."}

    # Train Linear Regression
    df['Target'] = df['Close'].shift(-1)
    data_for_ml = df.dropna()
    
    if len(data_for_ml) < 2:
        return {"symbol": symbol, "error": "Not enough data for ML training."}

    X = data_for_ml[features]
    y = data_for_ml['Target']
    
    model = LinearRegression()
    model.fit(X, y)

    # Predict
    last_row = df.iloc[[-1]][features]
    predicted_price = model.predict(last_row)[0]
    current_price = last_row['Close'].values[0]
    current_rsi = last_row['RSI'].values[0] if 'RSI' in last_row else 50
    atr = df['Volatility'].mean() if 'Volatility' in df else current_price * 0.01

    # --- FUNDAMENTAL ANALYSIS (The Hedge Fund Filter) ---
    analyst_score, analyst_sentiment = analyze_fundamentals(fundamentals)

    # --- FINAL "HEDGE FUND" DECISION LOGIC ---
    
    # 1. Technical Signal
    tech_signal = "HOLD"
    if predicted_price > current_price:
        tech_signal = "BUY"
    elif predicted_price < current_price:
        tech_signal = "SELL"

    # 2. Combine with Indicators
    # RSI Filter: Don't buy if overbought (>70), Don't sell if oversold (<30)
    if tech_signal == "BUY" and current_rsi > 70:
        tech_signal = "HOLD (Overbought)"
    if tech_signal == "SELL" and current_rsi < 30:
        tech_signal = "HOLD (Oversold)"
    
    # 3. Final Signal Construction
    final_signal = tech_signal
    confidence = "Standard"

    # Hedge Fund Boost: If Tech is BUY and Fundamentals are Strong -> STRONG BUY
    if "BUY" in tech_signal and tech_signal != "HOLD (Overbought)" and analyst_score > 0:
        final_signal = "STRONG BUY"
        confidence = "High (Tech + Funda)"
    
    # Hedge Fund Cut: If Tech is BUY but Fundamentals are Weak -> WEAK BUY
    if "BUY" in tech_signal and tech_signal != "HOLD (Overbought)" and analyst_score < 0:
        final_signal = "WEAK BUY"
        confidence = "Low (Conflict)"

    # --- TARGET & STOP LOSS ---
    if "BUY" in final_signal and final_signal != "HOLD (Overbought)":
        stop_loss = current_price - (atr * 1.5)
        target = predicted_price + atr
    elif "SELL" in final_signal and final_signal != "HOLD (Oversold)":
        stop_loss = current_price + (atr * 1.5)
        target = predicted_price - atr
    else:
        stop_loss = current_price - atr
        target = current_price + atr

    return {
        "symbol": symbol.upper(),
        "period_analyzed": period,
        "current_price": round(float(current_price), 2),
        "signal": final_signal,
        "predicted_target": round(float(target), 2),
        "stop_loss": round(float(stop_loss), 2),
        "rsi": round(float(current_rsi), 2),
        "confidence": confidence,
        "analyst_sentiment": analyst_sentiment,
        "analyst_score": round(analyst_score, 2)
    }

