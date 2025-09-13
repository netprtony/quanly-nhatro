import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
from insightface.app import FaceAnalysis
import cv2
from datetime import datetime

def ml_search_algorithm(dataframe, feature_column, test_vector, employee_info='Employee Id', thresh=0.45):
    X_list = dataframe[feature_column].tolist()
    x = np.asarray(X_list)
    similar = cosine_similarity(x, test_vector.reshape(1, -1))
    similar_arr = np.array(similar).flatten()
    dataframe['cosine'] = similar_arr
    data_filter = dataframe.query(f'cosine >= {thresh}')
    if len(data_filter) > 0:
        argmax = np.argmax(data_filter['cosine'].values)
        tenant_id = data_filter.iloc[argmax][employee_info]
    else:
        tenant_id = 'Unknown'
    return tenant_id

class FaceRecognition:
    def __init__(self, threshold=0.5):
        self.threshold = threshold
        self.faceApp = FaceAnalysis(name='buffalo_sc', root='insightface_model', providers=['CPUExecutionProvider'])
        self.faceApp.prepare(ctx_id=0, det_size=(640, 640), det_thresh=0.5)

    def compare_embeddings(self, embedding1, embedding2):
        """
        Compare two face embeddings using cosine similarity

        Args:
            embedding1: First face embedding vector
            embedding2: Second face embedding vector

        Returns:
            Similarity score between 0 and 1
        """
        try:
            similarity = cosine_similarity(
                embedding1.reshape(1, -1),
                embedding2.reshape(1, -1)
            )[0][0]
            return float(similarity)
        except Exception as e:
            logging.error(f"Failed to compare embeddings: {str(e)}")
            return 0.0

    def identify_face(self, target_embedding, reference_embeddings, threshold=None):
        """
        Identify a face by comparing it with reference embeddings

        Args:
            target_embedding: Embedding to identify
            reference_embeddings: Dict of {id: embedding} pairs
            threshold: Optional custom threshold

        Returns:
            (id, score) tuple or (None, 0) if no match
        """
        if threshold is None:
            threshold = self.threshold

        try:
            max_score = 0
            best_match_id = None

            for ref_id, ref_embedding in reference_embeddings.items():
                score = self.compare_embeddings(target_embedding, ref_embedding)
                if score > max_score:
                    max_score = score
                    best_match_id = ref_id

            if max_score >= threshold:
                return best_match_id, max_score
            return None, 0

        except Exception as e:
            logging.error(f"Face identification failed: {str(e)}")
            return None, 0

    def identify_face2(self, employees, target_frame, dataframe, feature_column, employee_info='tenant_id', thresh=0.5):
        employee = None
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        results = self.faceApp.get(target_frame)
        test_copy = target_frame.copy()
        tenant_id_detected = 'Unknown'

        for res in results:
            x1, y1, x2, y2 = res['bbox'].astype(int)
            embeddings = res['embedding']

            tenant_id_detected = ml_search_algorithm(dataframe, feature_column, embeddings, employee_info, thresh)

            if tenant_id_detected == 'Unknown':
                color = (0, 0, 255)
                person_name = 'Unknown'
            else:
                color = (0, 255, 0)
                employee = next((e for e in employees if e.tenant_id == tenant_id_detected), None)
                person_name = employee.employee_name if employee else 'Unknown'

            cv2.rectangle(test_copy, (x1, y1), (x2, y2), color)
            cv2.putText(test_copy, person_name, (x1, y1), cv2.FONT_HERSHEY_DUPLEX, 0.7, color, 2)
            cv2.putText(test_copy, current_time, (x1, y2 + 10), cv2.FONT_HERSHEY_DUPLEX, 0.7, color, 2)
            # self.logs['tenant_id'].append(tenant_id_detected)
            # self.logs['current_time'].append(current_time)

        return employee, test_copy