from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, database
from app.schemas import PaginatedDevicesOut, FilterRequest
from typing import List
from datetime import datetime
import base64
import os
import cv2
import numpy as np

router = APIRouter(prefix="/recognition-records", tags=["Recognition Records"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy danh sách bản ghi nhận diện (phân trang, tìm kiếm, sort)
@router.get("/", response_model=PaginatedDevicesOut)
def get_recognition_records(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm kiếm theo tenant_id hoặc status"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.RecognitionRecord).join(models.Tenant, models.RecognitionRecord.tenant_id == models.Tenant.tenant_id)

    if search:
        search_lower = search.strip().lower()
        query = query.filter(
            (models.RecognitionRecord.tenant_id.ilike(f"%{search_lower}%")) |
            (models.Tenant.full_name.ilike(f"%{search_lower}%")) |
            (models.RecognitionRecord.status.ilike(f"%{search_lower}%"))
        )

    # Xử lý sort
    valid_sort_fields = {
        "record_id": models.RecognitionRecord.record_id,
        "tenant_id": models.RecognitionRecord.tenant_id,
        "timestamp": models.RecognitionRecord.timestamp,
        "status": models.RecognitionRecord.status,
        "method": models.RecognitionRecord.method,
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

# Bộ lọc nâng cao
@router.post("/filter", response_model=PaginatedDevicesOut)
def filter_recognition_records(
    request: FilterRequest,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.RecognitionRecord)

    valid_fields = {
        "tenant_id": (models.RecognitionRecord.tenant_id, str),
        "status": (models.RecognitionRecord.status, str),
        "method": (models.RecognitionRecord.method, str),
        "timestamp": (models.RecognitionRecord.timestamp, str),
    }

    for f in getattr(request, "filters", []):
        col_type = valid_fields.get(f.field)
        if not col_type:
            continue
        col, py_type = col_type
        try:
            val = py_type(f.value)
        except Exception:
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
            if py_type == str:
                query = query.filter(col.ilike(f"%{val}%"))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

@router.post("/record")
def record_recognition(
    tenant_id: str,
    method: str = "manual",
    image: str = None,
    db: Session = Depends(get_db),
):
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID is required")

    if method not in ["face", "manual"]:
        raise HTTPException(status_code=400, detail="Invalid recognition method")

    today = datetime.now().date()

    # Kiểm tra xem tenant có tồn tại không
    tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Lấy lần check-in và check-out gần nhất cho tenant trong ngày hôm nay
    check_in_record = db.query(models.RecognitionRecord).filter(
        models.RecognitionRecord.tenant_id == tenant_id,
        models.RecognitionRecord.status == "Check-in",
        models.RecognitionRecord.timestamp >= datetime.combine(today, datetime.min.time()),
        models.RecognitionRecord.timestamp <= datetime.combine(today, datetime.max.time())
    ).order_by(models.RecognitionRecord.timestamp.desc()).first()

    check_out_record = db.query(models.RecognitionRecord).filter(
        models.RecognitionRecord.tenant_id == tenant_id,
        models.RecognitionRecord.status == "Check-out",
        models.RecognitionRecord.timestamp >= datetime.combine(today, datetime.min.time()),
        models.RecognitionRecord.timestamp <= datetime.combine(today, datetime.max.time())
    ).order_by(models.RecognitionRecord.timestamp.desc()).first()

    if check_in_record or check_out_record:
        return {
            "message": "Recognition already recorded for today",
            "last_check_in": {
                "timestamp": check_in_record.timestamp.isoformat() if check_in_record else None,
                "method": check_in_record.method if check_in_record else None,
                "image_path": check_in_record.image_path if check_in_record else None
            },
            "last_check_out": {
                "timestamp": check_out_record.timestamp.isoformat() if check_out_record else None,
                "method": check_out_record.method if check_out_record else None,
                "image_path": check_out_record.image_path if check_out_record else None
            }
        }

    # Xử lý ảnh nếu có (cho method='manual')
    manual_image_path = None
    if method == "manual" and image:
        try:
            image_data = base64.b64decode(image)
            image_np = np.frombuffer(image_data, np.uint8)
            image_cv = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
            if image_cv is None:
                raise HTTPException(status_code=400, detail="Could not decode image")

            # Lưu ảnh vào thư mục
            image_dir = "public/recognition_images"
            os.makedirs(image_dir, exist_ok=True)
            manual_image_path = f"{image_dir}/{tenant_id}_{today.isoformat()}_{datetime.now().strftime('%H%M%S')}.jpg"
            cv2.imwrite(manual_image_path, image_cv)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")

    # Tạo bản ghi mới
    new_record = models.RecognitionRecord(
        tenant_id=tenant_id,
        timestamp=datetime.now(),
        method=method,
        image_path=manual_image_path if method == "manual" else None,
        status="Check-in"  # Hoặc có thể thay đổi theo logic của bạn
    )

    db.add(new_record)
    db.commit()

    return {
        "message": "Recognition recorded successfully",
        "record": {
            "tenant_id": tenant_id,
            "date": today.isoformat(),
            "time": new_record.timestamp.time().isoformat(),
            "method": new_record.method,
            "image_path": new_record.image_path
        }
    }