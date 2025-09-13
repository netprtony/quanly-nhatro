import cv2
import numpy as np
import os
from fastapi import HTTPException
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
from app.utils import detect_and_crop_face
from app.face_recognition.detector import InsightFaceWrapper


class FaceDetector:
    def __init__(self, model_path=None):
        if model_path is None:
            # Lấy đường dẫn tuyệt đối đến file model
            PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            model_path = os.path.join(PROJECT_ROOT, "backend", "app", "face_recognition", "insightface_model", "buffalo_sc", "det_500m.onnx")
        try:
            self.face_embedder = InsightFaceWrapper(model_path=model_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize face embedder: {str(e)}")

    def detect_faces(self, image):
        """
        Detect and crop the largest face in the input image using utils.detect_and_crop_face

        Args:
            image: numpy array of the image (BGR format)

        Returns:
            List of cropped face images (usually 1 or 0)
        """
        if image is None or not isinstance(image, np.ndarray):
            raise HTTPException(status_code=400, detail=f"Ảnh đầu vào None hoặc không phải ndarray, type: {type(image)}")
        face_img = detect_and_crop_face(image)
        if face_img is None:
            raise HTTPException(status_code=400, detail="Không phát hiện được khuôn mặt trong ảnh")
        elif face_img.size == 0:
            raise HTTPException(status_code=400, detail="Ảnh crop được nhưng size=0")
        return [face_img]

    def get_face_embeddings(self, image, face_imgs=None):
        """
        Get face embeddings from cropped face images

        Args:
            image: numpy array of the image (BGR format)
            face_imgs: optional list of cropped face images (if already detected)

        Returns:
            List of face embeddings
        """
        try:
            faces = face_imgs if face_imgs is not None else self.detect_faces(image)
            embeddings = []
            for face in faces:
                # Resize về 112x112 nếu model yêu cầu
                face_resized = cv2.resize(face, (112, 112))
                input_blob = self.face_embedder.preprocess(face_resized)
                embedding = self.face_embedder.session.run(
                    None, {self.face_embedder.input_name: input_blob}
                )[0]
                embeddings.append(embedding.flatten())
            return embeddings
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get face embeddings: {str(e)}")
