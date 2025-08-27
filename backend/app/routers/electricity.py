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
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng hoặc tháng"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
    tenant_id: str = Query(None, description="Lọc theo tenant_id"),
):
    query = db.query(
        models.ElectricityMeter,
        models.Tenant.full_name
    ).join(
        models.Contract, models.Contract.room_id == models.ElectricityMeter.room_id
    ).join(
        models.Tenant, models.Contract.tenant_id == models.Tenant.tenant_id
    )

    if tenant_id:
        query = query.filter(models.Contract.tenant_id == tenant_id)

    if search:
        query = query.join(models.Room).filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (cast(models.ElectricityMeter.month, String).ilike(f"%{search}%"))
        )

    valid_sort_fields = {
        "meter_id": models.ElectricityMeter.meter_id,
        "room_id": models.ElectricityMeter.room_id,
        "month": models.ElectricityMeter.month,
        "full_name": models.Tenant.full_name,
        "created_at": models.ElectricityMeter.created_at,
    }
    if sort_field in valid_sort_fields:
        col = valid_sort_fields[sort_field]
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    # Trả về dữ liệu gồm ElectricityMeter và full_name
    result = [
        {
            **item[0].__dict__,
            "full_name": item[1]
        }
        for item in items
    ]
    return {"total": total, "items": result}

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

