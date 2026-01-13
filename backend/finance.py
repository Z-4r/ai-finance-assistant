import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("INDIAN_API_KEY")
BASE_URL = "https://stock.indianapi.in/stock"

def get_live_prices(symbols: list):
    """
    Fetches live prices for Indian stocks using IndianAPI.in.
    Input: ['RELIANCE', 'TCS', 'INFY']
    Output: {'RELIANCE': 2450.00, 'TCS': 3500.50, ...}
    """
    if not symbols:
        return {}

    prices = {}
    
    # Create a session for faster repeated requests
    session = requests.Session()
    session.headers.update({"X-Api-Key": API_KEY})

    for symbol in symbols:
        try:
            # IndianAPI often expects standard symbols. 
            # If your DB stores "RELIANCE", we might need to query "RELIANCE" or "RELIANCE.NS".
            # Let's try the symbol directly first.
            params = {"name": symbol}
            
            response = session.get(BASE_URL, params=params)
            
            if response.status_code == 200:
                data = response.json()
                # The API structure usually returns a 'currentPrice' or similar field.
                # Adjust key access based on exact API response structure.
                # Common structure: {'companyName': ..., 'currentPrice': 2400.00, ...}
                
                # Check for various price keys depending on exact endpoint version
                price = data.get("currentPrice") or data.get("lastPrice") or data.get("price")
                
                # Sometimes price is a dictionary like {"NSE": 2400, "BSE": 2399}
                if isinstance(price, dict):
                    price = price.get("NSE") or price.get("BSE")
                
                if price:
                    prices[symbol] = float(price)
                else:
                    print(f"Price not found in response for {symbol}")
                    prices[symbol] = 0.0
            else:
                print(f"Failed to fetch {symbol}: {response.status_code} - {response.text}")
                prices[symbol] = 0.0
                
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            prices[symbol] = 0.0
            
        # Respect rate limits (avoid getting banned)
        time.sleep(0.1) 

    return prices