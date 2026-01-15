import pandas as pd
import requests
import os
import random
import math
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("INDIAN_API_KEY")
STOCK_BASE_URL = "https://stock.indianapi.in/stock"
MF_BASE_URL = "https://stock.indianapi.in/mutual_fund"
CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "fd_rd_rates.csv")

def get_live_stock_price(symbol):
    """
    Fetches live stock price to calculate how many units the user can buy monthly.
    """
    try:
        # Ensure symbol has correct suffix for Indian markets if needed
        symbol_query = f"{symbol}.NS" if not symbol.endswith((".NS", ".BO")) else symbol
        
        params = {"name": symbol_query}
        headers = {"X-Api-Key": API_KEY}
        
        response = requests.get(STOCK_BASE_URL, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            # Handle various API response structures
            price = data.get("currentPrice") or data.get("lastPrice") or data.get("price")
            
            # Sometimes price is nested like {"NSE": 2400}
            if isinstance(price, dict):
                price = price.get("NSE", 0)
                
            return float(price) if price else 0.0
    except Exception as e:
        print(f"Stock API Error for {symbol}: {e}")
        return 0.0
    return 0.0

def get_mutual_fund_recommendation(risk_profile):
    """
    Searches IndianAPI for a mutual fund suitable for the risk profile 
    and returns its live NAV.
    """
    # 1. Select Search Keywords based on Risk
    if risk_profile == "low":
        keywords = ["Liquid", "Conservative Hybrid", "Corporate Bond"]
        category_desc = "Low Risk / Debt Scheme"
    elif risk_profile == "medium":
        keywords = ["Nifty 50 Index", "Flexi Cap", "Large & Mid Cap"]
        category_desc = "Moderate Risk / Equity"
    else: # high
        keywords = ["Small Cap", "Mid Cap", "Momentum"]
        category_desc = "High Risk / Aggressive Equity"

    search_term = random.choice(keywords)
    
    # 2. Call API
    params = {"name": search_term}
    headers = {"X-Api-Key": API_KEY}
    
    try:
        response = requests.get(MF_BASE_URL, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            # Handle list vs dict response structure
            funds = data if isinstance(data, list) else data.get("datasets", [])
            
            # Filter for funds that have a valid NAV
            valid_funds = []
            for f in funds:
                name = f.get("schemeName") or f.get("fundName") or f.get("name")
                nav = f.get("nav") or f.get("currentNav") or f.get("price")
                
                if name and nav:
                    valid_funds.append({"name": name, "nav": float(nav)})
            
            if valid_funds:
                selected = random.choice(valid_funds)
                return {
                    "name": selected["name"],
                    "nav": selected["nav"],
                    "category": category_desc
                }
                
    except Exception as e:
        print(f"MF API Error: {e}")

    # Fallback if API fails
    return {
        "name": f"HDFC {search_term} Fund (Growth)",
        "nav": 0.0,
        "category": category_desc,
        "note": "Live NAV unavailable"
    }

def get_best_rd_fd(amount, duration_years, type="RD"):
    """
    Reads CSV and finds the best FD or RD based on interest rate and duration.
    """
    try:
        if not os.path.exists(CSV_PATH):
            return None

        df = pd.read_csv(CSV_PATH)
        duration_months = duration_years * 12
        
        # Filter by Type (FD/RD), Amount, and Duration
        # We allow a small buffer in duration matching
        valid_opts = df[
            (df['Type'] == type) & 
            (df['Min_Investment'] <= amount) & 
            (df['Duration_Months'] <= duration_months + 12) 
        ]
        
        # If strict matching fails, relax duration check just to get a bank name
        if valid_opts.empty:
            valid_opts = df[(df['Type'] == type) & (df['Min_Investment'] <= amount)]

        if not valid_opts.empty:
            # Sort by Interest Rate (Descending)
            best_opt = valid_opts.sort_values(by='Interest_Rate', ascending=False).iloc[0]
            return best_opt.to_dict()
            
    except Exception as e:
        print(f"CSV Error: {e}")
    return None

def calculate_compound_growth(monthly_inv, rate, years):
    """
    Calculates Future Value of a SIP (Monthly Investment).
    Formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    """
    months = years * 12
    r = rate / 100 / 12  # Monthly interest rate
    if r == 0: return monthly_inv * months
    
    fv = monthly_inv * ((((1 + r) ** months) - 1) / r) * (1 + r)
    return fv

def generate_portfolio(user_profile, investable_amount, target_amount, time_horizon_years):
    """
    Generates a lifecycle investment plan.
    """
    risk = user_profile.risk_tolerance.lower() # low, medium, high
    
    plan = {
        "monthly_investment": investable_amount,
        "target_amount": target_amount,
        "timeline": f"{time_horizon_years} Years",
        "immediate_action": [], # What to do TODAY (RD, SIP)
        "future_strategy": [],  # What to do LATER (FD Reinvestment)
        "projection": {}
    }

    # --- 1. STRATEGY ALLOCATION ---
    # Define splits based on risk
    if risk == "low":
        rd_split = 0.70
        equity_split = 0.30
        expected_return_rate = 7.5 # Conservative mix return
        stock_picks = ["ITC", "HUL", "SBIN"] # Defensive stocks
        
    elif risk == "medium":
        rd_split = 0.40
        equity_split = 0.60
        expected_return_rate = 10.5 # Balanced mix return
        stock_picks = ["RELIANCE", "INFY", "TCS", "LT"] # Bluechips
        
    else: # high
        rd_split = 0.20
        equity_split = 0.80
        expected_return_rate = 14.0 # Aggressive mix return
        stock_picks = ["ZOMATO", "ADANIENT", "TATASTEEL", "DLF"] # High Beta

    # --- 2. IMMEDIATE ACTION (Monthly Splits) ---
    
    # A. Recurring Deposit (Safe Base)
    rd_amt = investable_amount * rd_split
    best_rd = get_best_rd_fd(rd_amt, time_horizon_years, "RD")
    
    if best_rd:
        rd_rate = best_rd['Interest_Rate']
        plan["immediate_action"].append({
            "instrument": "Recurring Deposit (RD)",
            "name": f"{best_rd['Bank']} RD Scheme",
            "amount_per_month": round(rd_amt, 2),
            "details": f"Interest Rate: {rd_rate}% | Tenure: Matches your goal"
        })
    else:
        rd_rate = 6.0 # Default assumption
        plan["immediate_action"].append({
            "instrument": "Recurring Deposit (RD)",
            "name": "Any Nationalized Bank RD",
            "amount_per_month": round(rd_amt, 2),
            "details": "Start a standard monthly RD for capital protection."
        })

    # B. Mutual Fund SIP (Wealth Builder)
    equity_amt = investable_amount * equity_split
    mf_amt = equity_amt * 0.60 # 60% of equity part goes to MFs
    stock_amt = equity_amt * 0.40 # 40% of equity part goes to Stocks
    
    mf_data = get_mutual_fund_recommendation(risk)
    
    plan["immediate_action"].append({
        "instrument": "Mutual Fund SIP",
        "name": mf_data["name"],
        "amount_per_month": round(mf_amt, 2),
        "details": f"Category: {mf_data['category']} | Current NAV: ₹{mf_data['nav']}"
    })

    # C. Direct Equity (Active Growth)
    selected_stock = random.choice(stock_picks)
    price = get_live_stock_price(selected_stock)
    
    stock_details = ""
    if price > 0:
        # Calculate how many shares they can buy monthly
        qty = int(stock_amt // price)
        if qty < 1: 
            # If stock is too expensive (e.g. MRF), suggest saving or buying fractional/ETF
            stock_details = f"Price (₹{price}) is high. Accumulate cash or buy NIFTYBEES."
        else:
            stock_details = f"Buy ~{qty} shares monthly @ approx ₹{price}"
    else:
        stock_details = "Live price unavailable. Invest for long term."

    plan["immediate_action"].append({
        "instrument": "Direct Equity",
        "name": f"{selected_stock} (NSE)",
        "amount_per_month": round(stock_amt, 2),
        "details": stock_details
    })

    # --- 3. FUTURE STRATEGY (Lifecycle Logic) ---
    # Find best FD for later
    # We assume a standard lump sum amount (e.g. 50k) just to find a valid rate in CSV
    best_fd = get_best_rd_fd(50000, 1, "FD") 
    fd_bank = best_fd['Bank'] if best_fd else "a top bank"
    fd_rate = best_fd['Interest_Rate'] if best_fd else 7.0
    
    strategy_text = (
        f"**Step 1:** Run the RD and SIPs strictly for the next {time_horizon_years} years.\n"
        f"**Step 2 (Lifecycle Event):** When your RD matures (typically every 12-24 months), "
        f"do NOT spend the maturity amount. Immediately reinvest the lump sum into a **Fixed Deposit (FD)** "
        f"at {fd_bank} (Target Rate: ~{fd_rate}%) for the remaining duration of your goal.\n"
        f"**Step 3:** Review your Mutual Fund performance every 6 months."
    )
    
    plan["future_strategy"] = strategy_text

    # --- 4. PROJECTION (Math) ---
    projected_val = calculate_compound_growth(investable_amount, expected_return_rate, time_horizon_years)
    shortfall = target_amount - projected_val
    
    plan["projection"] = {
        "projected_corpus": round(projected_val, 2),
        "target": target_amount,
        "status": "Achievable" if projected_val >= target_amount else "Shortfall",
        "shortfall_amount": round(shortfall, 2) if shortfall > 0 else 0,
        "message": "You are on track to hit your goal!" if shortfall <= 0 else f"You might fall short by ₹{round(shortfall)}. Consider increasing investment or extending time."
    }

    return plan