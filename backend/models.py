from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

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

    transactions = relationship("Transaction", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)  # e.g., "Food", "Salary", "Rent"
    type = Column(String, nullable=False)      # "income" or "expense"
    date = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")

    