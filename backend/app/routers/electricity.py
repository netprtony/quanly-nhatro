from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.electricity import ElectricityMeterCreate, ElectricityMeterUpdate, ElectricityMeterOut

router = APIRouter(prefix="/electricity", tags=["Electricity"])

@router.get("/", response_model=List[ElectricityMeterOut])
def get_meters(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Tìm theo phòng hoặc tháng")
):
    query = db.query(models.ElectricityMeter)
    if search:
        query = query.join(models.Room).filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (models.ElectricityMeter.month.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/{meter_id}", response_model=ElectricityMeterOut)
def get_meter(meter_id: int, db: Session = Depends(database.get_db)):
    meter = db.query(models.ElectricityMeter).filter(models.ElectricityMeter.meter_id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return meter

@router.post("/", response_model=ElectricityMeterOut, status_code=201)
def create_meter(meter: ElectricityMeterCreate, db: Session = Depends(database.get_db)):
    usage_kwh = meter.new_reading - meter.old_reading
    total_amount = usage_kwh * (meter.electricity_rate or 3500)
    db_meter = models.ElectricityMeter(
        **meter.dict(),
        usage_kwh=usage_kwh,
        total_amount=total_amount
    )
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
    # Tính lại usage_kwh và total_amount nếu có thay đổi readings
    if db_meter.old_reading is not None and db_meter.new_reading is not None:
        db_meter.usage_kwh = db_meter.new_reading - db_meter.old_reading
        db_meter.total_amount = db_meter.usage_kwh * (db_meter.electricity_rate or 3500)
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