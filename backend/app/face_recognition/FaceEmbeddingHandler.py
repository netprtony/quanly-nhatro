import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

import numpy as np
import pickle
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import cv2
from app.models import FaceEmbedding, Tenant
from app.utils import detect_and_crop_face
from app.face_recognition.detector import InsightFaceWrapper

class FaceEmbeddingHandler:
    def __init__(self, detector=None, model_path=None):
        self.detector = detector if detector else detect_and_crop_face
        self.face_embedder = InsightFaceWrapper(model_path=model_path) if model_path else InsightFaceWrapper()
        self.sample = 0

    def reset(self):
        self.sample = 0

    def process_and_save_embedding(self, tenant_id, avatar_img, session: Session):
        """
        Process image and save face embedding for a tenant

        Args:
            tenant_id: Tenant ID (string)
            avatar_img: numpy array (BGR) of tenant's avatar
            session: SQLAlchemy session
        """
        try:
            # Detect and crop face
            face_imgs = self.detector(avatar_img)
            if not face_imgs or len(face_imgs) == 0:
                return 'embedding_false'

            face_img = face_imgs[0]  # Lấy khuôn mặt đầu tiên

            # Đảm bảo ảnh màu và đủ lớn
            if len(face_img.shape) != 3 or face_img.shape[2] != 3:
                return 'embedding_false'
            if face_img.shape[0] < 80 or face_img.shape[1] < 80:
                return 'embedding_false'

            face_img = cv2.resize(face_img, (112, 112))
            input_blob = self.face_embedder.preprocess(face_img)
            embedding = self.face_embedder.session.run(
                None, {self.face_embedder.input_name: input_blob}
            )[0].flatten().astype(np.float32)

            if embedding is None or np.isnan(embedding).any() or np.all(embedding == 0):
                return 'embedding_false'

            # Save or update embedding - SỬA DÒNG NÀY
            face_embedding = session.query(FaceEmbedding).filter_by(
                tenant_id=tenant_id  # Thay tenant.tenant_id thành tenant_id
            ).first()

            if face_embedding:
                face_embedding.embedding = embedding.tobytes()
                face_embedding.updated_at = datetime.utcnow()
            else:
                face_embedding = FaceEmbedding(
                    tenant_id=tenant_id,  # Thay tenant.tenant_id thành tenant_id
                    embedding=embedding.tobytes(),
                    created_at=datetime.utcnow()
                )
                session.add(face_embedding)

            session.commit()
            return True

        except Exception as e:
            logging.error(f"Failed to process and save embedding: {str(e)}")
            raise

    def get_face_embedding(self, image):
        """
        Detect and get face embedding from image

        Args:
            image: numpy array (BGR)

        Returns:
            (face_img, embedding) or (None, None)
        """
        try:
            face_img = self.detector(image)
            if face_img is None or face_img.size == 0:
                return None, None
            face_img = cv2.resize(face_img, (112, 112))
            input_blob = self.face_embedder.preprocess(face_img)
            embedding = self.face_embedder.session.run(
                None, {self.face_embedder.input_name: input_blob}
            )[0].flatten().astype(np.float32)
            return face_img, embedding
        except Exception as e:
            logging.error(f"Failed to get face embedding: {str(e)}")
            return

    def validate_face_image(self, face_img):
        """
        Validate the cropped face image

        Args:
            face_img: numpy array (BGR) of the cropped face image

        Returns:
            bool: True if valid, False otherwise
        """
        if len(face_img.shape) != 3 or face_img.shape[2] != 3:
            logging.error("face_img không phải ảnh màu 3 kênh")
            return False
        if face_img.shape[0] < 80 or face_img.shape[1] < 80:
            logging.error("face_img quá nhỏ")
            return False
        return True