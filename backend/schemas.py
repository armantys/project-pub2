from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionCreate(BaseModel):
    label: str
    confidence: float
    image_path: str
    user_id: int

class PredictionOut(PredictionCreate):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str