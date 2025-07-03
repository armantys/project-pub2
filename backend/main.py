import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi import File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from db import SessionLocal, engine
from models import Base, Prediction, User, Image as DBImage 
from schemas import PredictionCreate, PredictionOut, UserCreate, UserLogin 
from crud import create_user
from auth import verify_password, create_access_token
import numpy as np
from typing import List
import time
import json
import logging
import cv2
import re
import base64
import tensorflow as tf
from pydantic import BaseModel
import shutil
import uuid
from fastapi.staticfiles import StaticFiles

app = FastAPI()

if os.path.isdir("image"):
    app.mount("/image", StaticFiles(directory="image"), name="image")

metrics_logger = logging.getLogger("metrics_logger")
logging.basicConfig(level=logging.INFO)

@app.middleware("http")
async def add_metrics(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    metrics_logger.info(json.dumps({
        "path": request.url.path,
        "duration": round(duration, 3),
        "status": response.status_code
    }))
    return response

app.mount("/image", StaticFiles(directory="image"), name="image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/save-prediction", response_model=PredictionOut)
def save_prediction(prediction: PredictionCreate, db: Session = Depends(get_db)):
    pred = Prediction(**prediction.dict())
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


Base.metadata.create_all(bind=engine)

# Dépendance DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@app.post("/users/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe invalide"
        )
    
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/prediction", response_model=list[PredictionOut])
def get_all_predictions(db: Session = Depends(get_db)):
    return db.query(Prediction).all()

@app.get("/")
def read_root():
    return {"message": "API FastAPI OK"}


# === Chargement du modèle une seule fois ===
MODEL_PATH = r"C:\Users\LSouq\OneDrive\Documents\GitHub\ludovic.souquet.formation\Projet\project-pub2\backend\models\model_with_dropout1.h5"  # mets le bon nom ici
IMG_SIZE = 100
model = tf.keras.models.load_model(MODEL_PATH)

# === Schéma pour recevoir l’image encodée ===
class ImageInput(BaseModel):
    image: str

# === Prétraitement de l’image base64 ===
def preprocess_image(base64_str):
    try:
        # Supprimer le header si présent
        if base64_str.startswith("data:image"):
            base64_str = re.sub(r"^data:image\/[a-zA-Z]+;base64,", "", base64_str)
        print("Image base64 reçue (début) :", base64_str[:100])

        image_data = base64.b64decode(base64_str)
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img.astype("float32") / 255.0
        return np.expand_dims(img, axis=0)
    except Exception as e:
        raise ValueError(f"Erreur de traitement d'image : {e}")
    
class PredictOut(BaseModel):
    result: str
    confidence: float

# === Nouvelle route d’inférence IA ===
@app.post("/predict")
async def predict_image(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Erreur de décodage de l'image")

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=0)

        prediction = model.predict(img)
        confidence_pub = float(prediction[0][1])
        confidence_nopub = float(prediction[0][0])
        label = "pub" if confidence_pub > confidence_nopub else "nopub"
        confidence = round(max(confidence_pub, confidence_nopub) * 100, 2)

        return {"result": label, "confidence": confidence}

    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})

@app.get("/image/")
def get_images(db: Session = Depends(get_db)):
    images = db.query(DBImage).filter(DBImage.pub != None).all()
    return [
        {
            "filename": img.filename,
            "filepath": img.filepath,
            "pub": img.pub
        }
        for img in images
    ]

@app.post("/upload-image")
def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = f"{uuid.uuid4()}.png"
    save_dir = "image"
    save_path = os.path.join(save_dir, filename)

    os.makedirs(save_dir, exist_ok=True)
    with open(save_path, "wb") as buffer:
        buffer.write(file.file.read())

    # === Lecture de l'image pour prédiction ===
    image_data = cv2.imread(save_path)
    img = cv2.resize(image_data, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    input_tensor = np.expand_dims(img, axis=0)

    # === Prédiction ===
    prediction = model.predict(input_tensor)[0]
    label_index = int(np.argmax(prediction))  # 0 ou 1
    confidence = float(np.max(prediction)) * 100

    # === Insertion avec le champ `pub` ===
    new_image = DBImage(
        filename=filename,
        filepath=save_path,
        uploaded_at=datetime.utcnow(),
        pub=label_index  # 🔥 ici 0 ou 1
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "filename": filename,
        "label": "pub" if label_index == 1 else "nopub",
        "confidence": confidence
    }

@app.get("/image/{filename}")
def get_image(filename: str, db: Session = Depends(get_db)):
    image = db.query(DBImage).filter(DBImage.filename == filename).first()
    if not image or not os.path.exists(image.filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image.filepath)

class PredictionCreate(BaseModel):
    label: str
    confidence: float
    image_path: str
    user_id: int  
