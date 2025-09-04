from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app import models, database
from app.schemas import TenantCreate, TenantUpdate, TenantOut, PaginatedTenantOut, FilterRequest, TenantResponse
from app import models, utils, database
import os
router = APIRouter(prefix="/tenants", tags=["Tenants"])

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
    return tenant

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
    db.delete(db_tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}

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
        "tenant_status": tenant.tenant_status.value if tenant.tenant_status else None,
        "address": tenant.address,
        "created_at": tenant.created_at,
    }

# ✅ Lấy thư mục gốc project (d:\NhaTroBaoBao)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

# ✅ Thư mục FE chính cho CCCD
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "nha-tro-fe", "public", "cccd")

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

