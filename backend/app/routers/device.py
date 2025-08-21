from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceOut, PaginatedDevices

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
