from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, database
from app.schemas import DeviceCreate, DeviceUpdate, DeviceOut, PaginatedDevicesOut, FilterRequest
from typing import List

router = APIRouter(prefix="/devices", tags=["Devices"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy danh sách thiết bị (phân trang, tìm kiếm, sort)
@router.get("/", response_model=PaginatedDevicesOut)
def get_devices(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm kiếm theo tên thiết bị, phòng hoặc trạng thái"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.Device)
    if search:
        search_lower = search.strip().lower()
        # Nhận diện trạng thái hoạt động giống như phòng
        active_keywords = ["đang hoạt động"]
        inactive_keywords = ["hư hỏng"]
        if any(kw in search_lower for kw in active_keywords):
            query = query.filter(models.Device.is_active == True)
        elif any(kw in search_lower for kw in inactive_keywords):
            query = query.filter(models.Device.is_active == False)
        else:
            query = query.filter(
                (models.Device.device_name.ilike(f"%{search}%")) |
                (models.Device.description.ilike(f"%{search}%"))
            )
    # Xử lý sort
    valid_sort_fields = {
        "device_id": models.Device.device_id,
        "device_name": models.Device.device_name,
        "room_id": models.Device.room_id,
        "is_active": models.Device.is_active,
        "created_at": models.Device.created_at,
        "description": models.Device.description,
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
def filter_devices(
    request: FilterRequest,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Device)

    valid_fields = {
        "device_name": (models.Device.device_name, str),
        "room_id": (models.Device.room_id, int),
        "is_active": (models.Device.is_active, bool),
        "description": (models.Device.description, str),
        "created_at": (models.Device.created_at, str),
    }

    for f in getattr(request, "filters", []):
        # Xử lý đặc biệt cho trường is_active với từ khóa tiếng Việt
        if f.field == "is_active":
            val = f.value.strip().lower()
            active_keywords = ["hoạt động"]
            inactive_keywords = ["hư hỏng"]
            if any(kw in val for kw in active_keywords):
                query = query.filter(models.Device.is_active == True)
                continue
            elif any(kw in val for kw in inactive_keywords):
                query = query.filter(models.Device.is_active == False)
                continue
        col_type = valid_fields.get(f.field)
        if not col_type:
            continue
        col, py_type = col_type
        try:
            if py_type == bool:
                val = f.value.lower() in ("true", "1", "yes")
            else:
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

# Tạo mới thiết bị
@router.post("/", response_model=DeviceOut, status_code=201)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    db_device = models.Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

# Lấy chi tiết thiết bị
@router.get("/{device_id}", response_model=DeviceOut)
def get_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Thiết bị không tồn tại")
    return device

# Sửa thiết bị
@router.put("/{device_id}", response_model=DeviceOut)
def update_device(device_id: int, device: DeviceUpdate, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Thiết bị không tồn tại")
    for key, value in device.dict(exclude_unset=True).items():
        setattr(db_device, key, value)
    db.commit()
    db.refresh(db_device)
    return db_device

# Xóa thiết bị
@router.delete("/{device_id}", response_model=dict)
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Thiết bị không tồn tại")
    db.delete(db_device)
    db.commit()
    return {"message": "Xóa thiết bị thành công"}