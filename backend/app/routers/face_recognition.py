from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from app.face_recognition.detector import InsightFaceWrapper, find_best_match
from app.face_recognition.embedding import embeddings_from_image, mean_embedding, serialize_embedding, deserialize_embedding
from app.models import FaceEmbedding

router = APIRouter(prefix="/face", tags=["Face Recognition"])

# singleton: init once at app startup (avoid init mỗi request)
face_app = InsightFaceWrapper(model_name='buffalo_sc', model_root='insightface_model')

@router.post("/enroll/{tenant_id}")
async def enroll(tenant_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    data = await file.read()
    import numpy as np, cv2
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    embs = embeddings_from_image(face_app, img)
    if not embs:
        raise HTTPException(400, "No face detected")
    emb = mean_embedding(embs)
    blob = serialize_embedding(emb)
    existing = db.query(FaceEmbedding).filter_by(tenant_id=tenant_id).first()
    if existing:
        existing.embedding = blob
        existing.updated_at = datetime.utcnow()
    else:
        fe = FaceEmbedding(tenant_id=tenant_id, embedding=blob, created_at=datetime.utcnow())
        db.add(fe)
    db.commit()
    return {"status": "ok"}

@router.post("/identify")
async def identify(file: UploadFile = File(...), threshold: float = 0.5, db: Session = Depends(get_db)):
    data = await file.read()
    import numpy as np, cv2
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    results = face_app.get(img, max_num=5)
    if not results:
        return {"matches": []}

    # load all embeddings into memory (for small db). For big db, use vector DB.
    rows = db.query(FaceEmbedding).all()
    candidates = {}
    for r in rows:
        candidates[r.tenant_id] = deserialize_embedding(r.embedding)

    matches = []
    for r in results:
        emb = r['embedding'].astype(np.float32)
        tenant_id, score = find_best_match(emb, candidates, threshold=threshold)
        matches.append({"tenant_id": tenant_id, "score": score})
    return {"matches": matches}

@router.delete("/embedding/{tenant_id}")
def delete_embedding(tenant_id: str, db: Session = Depends(get_db)):
    embedding = db.query(FaceEmbedding).filter_by(tenant_id=tenant_id).first()
    if not embedding:
        raise HTTPException(status_code=404, detail="Embedding not found")
    db.delete(embedding)
    db.commit()
    return {"status": "deleted"}
