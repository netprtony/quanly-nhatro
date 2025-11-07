import numpy as np
import pickle
from datetime import datetime

def embeddings_from_image(face_app, image, detect=True):
    if detect:
        results = face_app.get(image, max_num=5)
        return [res['embedding'] for res in results]
    else:
        input_blob = face_app.preprocess(image)
        embedding = face_app.session.run(None, {face_app.input_name: input_blob})[0]  # <-- dùng input_name
        return [embedding.flatten()]

def mean_embedding(embeddings):
    if not embeddings:
        return None
    arr = np.stack(embeddings, axis=0)
    return np.mean(arr, axis=0).astype(np.float32)

def serialize_embedding(np_array):
    # Option A: bytes and store dtype/shape separately (recommended)
    return np_array.tobytes()

def deserialize_embedding(blob, shape=(512,), dtype=np.float32):
    return np.frombuffer(blob, dtype=dtype).reshape(shape)
