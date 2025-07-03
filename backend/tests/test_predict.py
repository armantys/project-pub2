import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_predict_endpoint():
    with open("tests/sample_image.png", "rb") as img_file:
        response = client.post(
            "/predict",
            files={"image": ("sample_image.png", img_file)}
        )
    assert response.status_code == 200
    assert "result" in response.json()
