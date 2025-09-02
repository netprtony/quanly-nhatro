from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, cast, String
from typing import List
from app import models, database
from app.schemas.electricity import ElectricityMeterCreate, PaginatedElectricityMeterOut, ElectricityMeterUpdate, ElectricityMeterOut, FilterRequest
from datetime import date
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse
router = APIRouter(prefix="/electricity", tags=["Electricity"])
@router.get("/latest", response_model=ElectricityMeterOut)
def get_latest_electricity_bill(
    room_id: int = Query(..., description="ID của phòng cần lấy hóa đơn mới nhất"),
    db: Session = Depends(database.get_db),
):
    meter = (
        db.query(models.ElectricityMeter)
        .filter(models.ElectricityMeter.room_id == room_id)
        .order_by(desc(models.ElectricityMeter.month))
        .first()
    )
    if not meter:
        raise HTTPException(status_code=404, detail="No electricity bill found for this room")
    return meter
@router.get("/", response_model=PaginatedElectricityMeterOut)
def get_meters(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng, tháng hoặc tổng tiền"),
    room_id: int = Query(None, description="Lọc theo room_id"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp: asc/desc"),
):
    query = db.query(models.ElectricityMeter).join(models.Room)

    # Lọc theo search
    if search:
        query = query.filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (cast(models.ElectricityMeter.month, String).ilike(f"%{search}%")) |
            (cast(models.ElectricityMeter.total_amount, String).ilike(f"%{search}%"))
        )

    # Lọc theo room_id
    if room_id:
        query = query.filter(models.ElectricityMeter.room_id == room_id)

    # Sắp xếp
    if sort_field:
        sort_column = getattr(models.ElectricityMeter, sort_field, None)
        if sort_column is not None:
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {"total": total, "items": items}

@router.get("/{meter_id}", response_model=ElectricityMeterOut)
def get_meter(meter_id: int, db: Session = Depends(database.get_db)):
    meter = db.query(models.ElectricityMeter).filter(models.ElectricityMeter.meter_id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return meter

@router.post("/", response_model=ElectricityMeterOut, status_code=201)
def create_meter(meter: ElectricityMeterCreate, db: Session = Depends(database.get_db)):
    # kiểm tra trùng
    existing = db.query(models.ElectricityMeter).filter(
        models.ElectricityMeter.room_id == meter.room_id,
        models.ElectricityMeter.month == meter.month
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Electricity meter for room {meter.room_id} and month {meter.month} already exists"
        )

    data = meter.dict()
    data.pop("usage_kwh", None)
    data.pop("total_amount", None)

    db_meter = models.ElectricityMeter(**data)
    db.add(db_meter)
    db.commit()
    db.refresh(db_meter)
    return db_meter

@router.put("/{meter_id}", response_model=ElectricityMeterOut)
def update_meter(meter_id: int, meter: ElectricityMeterUpdate, db: Session = Depends(database.get_db)):
    db_meter = db.query(models.ElectricityMeter).filter(models.ElectricityMeter.meter_id == meter_id).first()
    if not db_meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    for key, value in meter.dict(exclude_unset=True).items():
        setattr(db_meter, key, value)
    # ❌ KHÔNG set usage_kwh, total_amount (MySQL sẽ tự tính)
    db.commit()
    db.refresh(db_meter)
    return db_meter

@router.delete("/{meter_id}", response_model=dict)
def delete_meter(meter_id: int, db: Session = Depends(database.get_db)):
    db_meter = db.query(models.ElectricityMeter).filter(models.ElectricityMeter.meter_id == meter_id).first()
    if not db_meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    db.delete(db_meter)
    db.commit()
    return {"message": "Meter deleted successfully"}

@router.post("/filter", response_model=PaginatedElectricityMeterOut)
def filter_electricity_meters(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.ElectricityMeter).join(models.Room)
    valid_filters = {
        "month": (models.ElectricityMeter.month, str),
        "room_id": (models.ElectricityMeter.room_id, int),
        "room_number": (models.Room.room_number, str),
        "old_reading": (models.ElectricityMeter.old_reading, int),
        "new_reading": (models.ElectricityMeter.new_reading, int),
        "total_amount": (models.ElectricityMeter.total_amount, float),
    }
    for f in request.filters:
        col_type = valid_filters.get(f.field)
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

    return {"total": total, "items": items}

