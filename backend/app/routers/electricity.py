from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from typing import List
from app import models, database
from app.schemas.electricity import ElectricityMeterCreate, PaginatedElectricityMeterOut, ElectricityMeterUpdate, ElectricityMeterOut
from datetime import date
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse
router = APIRouter(prefix="/electricity", tags=["Electricity"])

@router.get("/", response_model=PaginatedElectricityMeterOut)
def get_meters(
    db:Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng hoặc tháng")
):
    query = db.query(models.ElectricityMeter)
    if search:
        query = query.join(models.Room).filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (cast(models.ElectricityMeter.month, String).ilike(f"%{search}%"))
        )

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
    data = meter.dict()
    # usage_kwh & total_amount là GENERATED => không set
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

@router.get("/latest", response_model=ElectricityMeterOut)
def get_latest_meter(invoice_id: int, db: Session = Depends(database.get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    meter = (
        db.query(models.ElectricityMeter)
        .filter(
            models.ElectricityMeter.room_id == invoice.room_id,
            models.ElectricityMeter.month <= invoice.month
        )
        .order_by(models.ElectricityMeter.month.desc())
        .first()
    )
    if not meter:
        raise HTTPException(status_code=404, detail="No electricity meter found for this room/month")
    return meter

