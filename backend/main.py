from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models
from database import get_db, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ai Finanace Assistant")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Finance Assistant API!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "Connection Successful"}