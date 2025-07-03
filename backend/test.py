import requests
import base64
import json
import matplotlib.pyplot as plt
import cv2

# === Paramètres ===
API_URL = "http://localhost:8000/predict"  # L'URL de ton API
IMG_PATH = r"C:\Users\LSouq\OneDrive\Documents\GitHub\ludovic.souquet.formation\Projet\project-pub2\backend\test_images\14.png"

# === Lecture de l'image et encodage en base64 ===
with open(IMG_PATH, "rb") as f:
    image_bytes = f.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

# === Préparation de la requête ===
payload = json.dumps({"image": image_b64})
headers = {"Content-Type": "application/json"}

# === Envoi de la requête ===
response = requests.post(API_URL, data=payload, headers=headers)

# === Traitement de la réponse ===
if response.status_code == 200:
    result = response.json().get("result", "inconnue")
    print("✅ Prédiction :", result)

    # === Affichage de l’image avec le résultat ===
    img = cv2.imread(IMG_PATH)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    result = response.json()
    label = result.get("result", "inconnue")
    confidence = result.get("confidence", 0)

    plt.imshow(img)
    plt.axis("off")
    plt.title(f"{label} ({confidence}%)")
    plt.show()
else:
    print("❌ Échec de la requête. Code :", response.status_code)
    print("Message :", response.text)
