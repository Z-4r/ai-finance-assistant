AI-Powered Finance Assistant
A robust web application designed to help users track their stock portfolios, calculate real-time profit and loss, and receive AI-driven market insights. Built with a high-performance FastAPI backend deployed on AWS.

 Features
Secure Authentication: User registration and login using JWT tokens.

Real-Time Dashboard: Get an instant overview of total invested capital, current portfolio value, and overall profit/loss percentage.

Portfolio Management: Easily add, edit, and track stock holdings (symbol, quantity, buy price).

Live Market Data: Integration with finance APIs (e.g., yfinance) to fetch near real-time stock prices for accurate valuation.

AI Predictions: (Future/Current capability) View market predictions and signals for specific assets.

RESTful API: Fully documented API capability via Swagger UI.

🛠️ Tech Stack
Backend Framework: FastAPI (Python) - Chosen for its speed and ease of use.

Database ORM: SQLAlchemy - For interacting with the database using Python objects.

Database: SQLite (Development) / Ready for PostgreSQL (Production).

Data Fetching: yfinance - For retrieving market data.

Authentication: OAuth2 with Password flow and JWT tokens.

Deployment: AWS EC2 (Ubuntu Linux), Nginx (Reverse Proxy), Gunicorn/Uvicorn (Process Management).

📦 Local Installation & Setup
Follow these steps to run the backend server locally on your machine.

Prerequisites
Python 3.8 or higher

Git

Steps
Clone the Repository

git clone https://github.com/Z-4r/ai-finance-assistant.git
cd YOUR_REPO_NAME
Create and Activate Virtual Environment

Create a Virtual Environment:
Windows
python -m venv venv
venv\Scripts\activate

Mac/Linux:
python3 -m venv venv
source venv/bin/activate

Install Dependencies
pip install -r requirements.txt

Run the Server
uvicorn backend.main:app --reload

For Frontend:
cd frontend
npm install

Run the Development Server Start the frontend application:
npm run dev

