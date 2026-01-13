from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    full_name: Optional[str] = None

    class Config:
        from_attribute = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TransactionBase(BaseModel):
    amount: float
    category: str
    type: str # 'income' or 'expense'
    note: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    symbol: str
    quantity: float
    buy_price: float
    asset_type: str

class AssetCreate(AssetBase):
    pass

class AssetOut(AssetBase):
    id: int
    class Config:
        from_attribute = True