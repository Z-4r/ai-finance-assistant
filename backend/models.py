from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)

    risk_tolerance = Column(String, default="moderate") 
    monthly_income = Column(Float, default=0.0)
    financial_goal = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())