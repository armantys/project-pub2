from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from db import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)

    predictions = relationship("Prediction", back_populates="user")
    images = relationship("Image", back_populates="user")
    label_revisions = relationship("LabelRevision", back_populates="changer")
    logs = relationship("Log", back_populates="user")

class ModelVersion(Base):
    __tablename__ = "model_version"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    loaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

class Prediction(Base):
    __tablename__ = "prediction"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("model_version.id"))
    label = Column(String(10))
    confidence = Column(Float)
    image_path = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    user = relationship("User", back_populates="predictions")

class Image(Base):
    __tablename__ = "image"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    filepath = Column(String(255))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("user.id"))
    pub = Column(Integer)

    user = relationship("User", back_populates="images")

class LabelRevision(Base):
    __tablename__ = "label_revision"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("prediction.id"))
    old_label = Column(String(10))
    new_label = Column(String(10))
    changed_by = Column(Integer, ForeignKey("user.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    changer = relationship("User", back_populates="label_revisions")

class PredictionCreate(BaseModel):
    model_id: int
    label: str
    confidence: float
    image_path: str
    user_id: int

class PredictionOut(PredictionCreate):
    id: int
    timestamp: Optional[datetime]

    class Config:
        orm_mode = True

class Log(Base):
    __tablename__ = "log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    level = Column(String(20))
    message = Column(Text)
    user_id = Column(Integer, ForeignKey("user.id"))
    action = Column(String(100))

    user = relationship("User", back_populates="logs")