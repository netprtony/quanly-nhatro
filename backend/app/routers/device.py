from fastapi import APIRouter, Depends, HTTPException, Query
from httpx import request
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceOut, PaginatedDevices,FilterRequest

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("/", response_model=PaginatedDevices)
def get_devices(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo tên thiết bị hoặc phòng")
):
    query = db.query(models.Device)
    if search:
        query = query.join(models.Room).filter(
            (models.Device.device_name.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}


@router.get("/{device_id}", response_model=DeviceOut)
def get_device(device_id: int, db: Session = Depends(database.get_db)):
    device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/", response_model=DeviceOut, status_code=201)
def create_device(device: DeviceCreate, db: Session = Depends(database.get_db)):
    db_device = models.Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.put("/{device_id}", response_model=DeviceOut)
def update_device(device_id: int, device: DeviceUpdate, db: Session = Depends(database.get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    for key, value in device.dict(exclude_unset=True).items():
        setattr(db_device, key, value)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.delete("/{device_id}", response_model=dict)
def delete_device(device_id: int, db: Session = Depends(database.get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(db_device)
    db.commit()
    return {"message": "Device deleted successfully"}

@router.post("/filter", response_model=PaginatedDevices)
def filter_devices(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200)
):
    query = db.query(models.Device)
    valid_fields = {
        "device_name": models.Device.device_name,
        "room_id": models.Device.room_id,
        "is_active": models.Device.is_active,
        "description": models.Device.description,
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