import logging
import cv2
import numpy as np
import onnxruntime as ort
from numpy.linalg import norm
import os

class InsightFaceWrapper:
    def __init__(self, model_path=None, providers=None):
        if providers is None:
            providers = ["CPUExecutionProvider"]
        PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        if model_path is None:
            model_path = os.path.join(PROJECT_ROOT, "backend", "app", "face_recognition", "insightface_model", "buffalo_sc", "w600k_mbf.onnx")
        if not os.path.isfile(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        try:
            self.session = ort.InferenceSession(model_path, providers=providers)
            self.input_name = self.session.get_inputs()[0].name
            self.detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        except Exception as e:
            logging.exception("Fail to init Face Recognition model")
            raise

    def preprocess(self, face_img):
        face = cv2.resize(face_img, (112, 112))
        face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
        face = face.astype(np.float32) / 127.5 - 1.0
        face = np.transpose(face, (2, 0, 1))  # CHW
        return np.expand_dims(face, axis=0)

    def get(self, img, max_num=0):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
        results = []
        count = 0
        for (x, y, w, h) in faces:
            face_crop = img[y:y+h, x:x+w]
            input_blob = self.preprocess(face_crop)
            embedding = self.session.run(None, {self.input_name: input_blob})[0]  # <-- Dùng input_name
            results.append({
                "bbox": (x, y, w, h),
                "embedding": embedding.flatten()
            })
            count += 1
            if max_num > 0 and count >= max_num:
                break
        return results
