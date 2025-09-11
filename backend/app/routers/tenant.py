from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app import models, database
from app.schemas import TenantCreate, TenantUpdate, TenantOut, PaginatedTenantOut, FilterRequest, TenantResponse
from app import models, utils, database
import cv2, os, numpy as np
from mtcnn import MTCNN
from app.models import FaceEmbedding
from app.face_recognition.detector import InsightFaceWrapper
from app.face_recognition.embedding import embeddings_from_image, mean_embedding, serialize_embedding
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  
router = APIRouter(prefix="/tenants", tags=["Tenants"])
# ✅ Lấy thư mục gốc project (d:\NhaTroBaoBao)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FACE_APP_DIR = os.path.join(PROJECT_ROOT, "backend", "insightface_model", "buffalo_sc", "w600k_mbf.onnx")
# Khởi tạo face_app 1 lần
face_app = InsightFaceWrapper(model_path=FACE_APP_DIR)
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/all", response_model=List[TenantResponse])
def get_all_tenants(
    tenant_status: Optional[str] = Query(None, description="Lọc theo trạng thái thuê"),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Tenant)
    if tenant_status:
        query = query.filter(models.Tenant.tenant_status == tenant_status)
    tenants = query.all()
    result = []
    for tenant in tenants:
        result.append({
            "tenant_id": tenant.tenant_id,
            "full_name": tenant.full_name,
            "gender": tenant.gender.value if tenant.gender else None,
            "date_of_birth": tenant.date_of_birth,
            "phone_number": tenant.phone_number,
            "id_card_front_path": tenant.id_card_front_path,
            "id_card_back_path": tenant.id_card_back_path,
            "avatar_path": tenant.avatar_path,  # <-- thêm dòng này
            "tenant_status": tenant.tenant_status.value if tenant.tenant_status else None,
            "address": tenant.address,
            "created_at": tenant.created_at,
        })
    return result
# Lấy danh sách tenant (có phân trang, tìm kiếm)
@router.get("/", response_model=PaginatedTenantOut)
def get_tenants(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    page_size: int = Query(20, ge=1, le=200, description="Số item mỗi trang"),
    search: str = Query(None, description="Tìm kiếm theo tên hoặc số điện thoại"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.Tenant)
    if search:
        query = query.filter(
            (models.Tenant.full_name.ilike(f"%{search}%")) |
            (models.Tenant.phone_number.ilike(f"%{search}%")) |
            (models.Tenant.address.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%"))
        )
    # thêm xử lý sort
    valid_sort_fields = {
        "tenant_id": models.Tenant.tenant_id,
        "full_name": models.Tenant.full_name,
        "phone_number": models.Tenant.phone_number,
        "address": models.Tenant.address,
        "created_at": models.Tenant.created_at,
    }
    if sort_field in valid_sort_fields:
        col = valid_sort_fields[sort_field]
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())
    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return {"items": items, "total": total}

# Lấy chi tiết tenant
@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant  # Nếu schema TenantOut đã có avatar_path thì không cần sửa gì thêm

# Tạo mới tenant
@router.post("/", response_model=TenantOut, status_code=201)
def create_tenant(tenant: TenantCreate, db: Session = Depends(get_db)):
    if db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant.tenant_id).first():
        raise HTTPException(status_code=400, detail="Tenant ID already exists")
    db_tenant = models.Tenant(**tenant.dict())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# Cập nhật tenant
@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(tenant_id: str, tenant: TenantUpdate, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for key, value in tenant.dict(exclude_unset=True).items():
        setattr(db_tenant, key, value)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# Xóa tenant
@router.delete("/{tenant_id}", response_model=dict)
def delete_tenant(tenant_id: str, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    # Xóa embedding trực tiếp trong DB
    embedding = db.query(FaceEmbedding).filter_by(tenant_id=tenant_id).first()
    if embedding:
        db.delete(embedding)
    db.delete(db_tenant)
    db.commit()
    return {"message": "Deleted"}

@router.post("/filter", response_model=PaginatedTenantOut)
def filter_tenants(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Tenant)

    # Map field hợp lệ
    valid_fields = {
        "full_name": (models.Tenant.full_name, str),
        "gender": (models.Tenant.gender, str),
        "date_of_birth": (models.Tenant.date_of_birth, date),
        "is_rent": (models.Tenant.is_rent, bool),
        "phone_number": (models.Tenant.phone_number, str),
        "created_at": (models.Tenant.created_at, datetime),
    }

    for f in request.filters:
        col_type = valid_fields.get(f.field)
        if not col_type:
            continue

        col, py_type = col_type

        # ép kiểu value
        try:
            if py_type == bool:
                val = f.value.lower() in ("true", "1", "yes")
            else:
                val = py_type(f.value)
        except Exception:
            # nếu không ép được thì bỏ qua filter này
            continue

        if f.operator == "=":
            query = query.filter(col == val)
        elif f.operator == "!=":
            query = query.filter(col != val)
        elif f.operator == ">":
            query = query.filter(col > val)
        elif f.operator == "<":
            query = query.filter(col < val)
        elif f.operator == ">=":
            query = query.filter(col >= val)
        elif f.operator == "<=":
            query = query.filter(col <= val)
        elif f.operator == "~":
            # chỉ apply LIKE cho chuỗi
            if py_type == str:
                query = query.filter(col.ilike(f"%{val}%"))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

@router.get("/from-user/{user_id}", response_model=TenantResponse)
def get_tenant_from_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    tenant = user.tenant
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found for this user")
    return {
        "tenant_id": tenant.tenant_id,
        "full_name": tenant.full_name,
        "gender": tenant.gender.value if tenant.gender else None,
        "date_of_birth": tenant.date_of_birth,
        "phone_number": tenant.phone_number,
        "id_card_front_path": tenant.id_card_front_path,
        "id_card_back_path": tenant.id_card_back_path,
        "avatar_path": tenant.avatar_path,  # <-- thêm dòng này
        "tenant_status": tenant.tenant_status.value if tenant.tenant_status else None,
        "address": tenant.address,
        "created_at": tenant.created_at,
    }



# ✅ Thư mục FE chính cho CCCD
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "nha-tro-fe", "public", "cccd")

# ✅ Thư mục FE chính cho avatar
AVATAR_UPLOAD_DIR = os.path.join(PROJECT_ROOT, "nha-tro-fe", "public", "avatar")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif"}


@router.post("/upload-cccd")
async def upload_cccd(
    file: UploadFile = File(...),
    tenant_id: str = Query(..., description="ID khách thuê để đặt tên file"),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Chỉ được upload file ảnh (jpg, png, gif)")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ")

    # Đặt tên file theo tenant_id, ví dụ: {tenant_id}_front.jpg hoặc {tenant_id}_back.jpg
    filename = f"{tenant_id}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Ghi đè file nếu đã tồn tại
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    return {"image_path": f"/cccd/{filename}"}

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    tenant_id: str = Query(..., description="ID khách thuê để đặt tên file"),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".gif"}:
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ")

    # Đọc ảnh
    image_bytes = await file.read()
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Không đọc được file ảnh")

    # Chuyển sang RGB cho MTCNN
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    detector = MTCNN()
    results = detector.detect_faces(img_rgb)
    if not results:
        raise HTTPException(status_code=400, detail="Không phát hiện được khuôn mặt trong ảnh")
    
    
    # Lấy khuôn mặt lớn nhất và crop an toàn
    face = max(results, key=lambda x: x['box'][2] * x['box'][3])
    x, y, w, h = face['box']
    h_img, w_img = img.shape[:2]
    x, y = max(0, x), max(0, y)
    x2, y2 = min(w_img, x + w), min(h_img, y + h)
    face_img = img[y:y2, x:x2]
    if face_img.size == 0:
        raise HTTPException(status_code=400, detail="Crop khuôn mặt bị lỗi")

    print("face_img shape:", face_img.shape)
    face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
    results = face_app.get(face_img_rgb, max_num=5)
    print("face_app.get results:", results)
    embs = [res['embedding'].astype(np.float32) for res in results]

    # Lưu avatar
    filename = f"{tenant_id}_avatar{ext}"
    save_path = os.path.join(AVATAR_UPLOAD_DIR, filename)
    os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
    cv2.imwrite(save_path, face_img)

    print(f"face_img shape after crop: {face_img.shape}, dtype={face_img.dtype}")
    face_img = cv2.resize(face_img, (112, 112))
    # Lấy embedding
    embs = embeddings_from_image(face_app, face_img, detect=False)
    if not embs:
        raise HTTPException(status_code=400, detail="Không lấy được embedding từ khuôn mặt")
    emb = mean_embedding(embs)
    blob = serialize_embedding(emb)
    print("Embedding size:", len(emb), "Serialized size:", len(blob))
    # Cập nhật DB
    existing = db.query(FaceEmbedding).filter_by(tenant_id=tenant_id).first()
    if existing:
        existing.embedding = blob
        existing.updated_at = datetime.utcnow()
    else:
        db.add(FaceEmbedding(tenant_id=tenant_id, embedding=blob, created_at=datetime.utcnow()))

    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant không tồn tại")
    db_tenant.avatar_path = f"/avatar/{filename}"

    db.commit()
    return {"avatar_path": f"/avatar/{filename}"}





