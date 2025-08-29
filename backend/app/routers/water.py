from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, cast, String
from typing import List
from app import models, database
from app.schemas.water import WaterMeterCreate, PaginatedWaterMeterOut, WaterMeterUpdate, WaterMeterOut, FilterRequest
from datetime import date
router = APIRouter(prefix="/water", tags=["Water"])

@router.get("/", response_model=PaginatedWaterMeterOut)
def get_meters(
	db: Session = Depends(database.get_db),
	page: int = Query(1, ge=1),
	page_size: int = Query(20, ge=1, le=200),
	search: str = Query(None, description="Tìm theo phòng hoặc tháng"),
	room_id: int = Query(None, description="Lọc theo room_id"),
	sort_field: str = Query(None, description="Trường sắp xếp"),
	sort_order: str = Query("asc", description="Thứ tự sắp xếp: asc/desc"),
):
	query = db.query(models.WaterMeter).join(models.Room)

	# Lọc theo search
	if search:
		query = query.filter(
			(models.Room.room_number.ilike(f"%{search}%")) |
			(cast(models.WaterMeter.month, String).ilike(f"%{search}%"))
		)

	# Lọc theo room_id
	if room_id:
		query = query.filter(models.WaterMeter.room_id == room_id)

	# Sắp xếp
	if sort_field:
		sort_column = getattr(models.WaterMeter, sort_field, None)
		if sort_column is not None:
			if sort_order.lower() == "desc":
				query = query.order_by(desc(sort_column))
			else:
				query = query.order_by(asc(sort_column))

	total = query.count()
	items = query.offset((page - 1) * page_size).limit(page_size).all()

	return {"total": total, "items": items}

@router.get("/{meter_id}", response_model=WaterMeterOut)
def get_meter(meter_id: int, db: Session = Depends(database.get_db)):
	meter = db.query(models.WaterMeter).filter(models.WaterMeter.meter_id == meter_id).first()
	if not meter:
		raise HTTPException(status_code=404, detail="Meter not found")
	return meter

@router.post("/", response_model=WaterMeterOut, status_code=201)
def create_meter(meter: WaterMeterCreate, db: Session = Depends(database.get_db)):
	# kiểm tra trùng
	existing = db.query(models.WaterMeter).filter(
		models.WaterMeter.room_id == meter.room_id,
		models.WaterMeter.month == meter.month
	).first()

	if existing:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail=f"Water meter for room {meter.room_id} and month {meter.month} already exists"
		)

	data = meter.dict()
	data.pop("usage_m3", None)
	data.pop("total_amount", None)

	db_meter = models.WaterMeter(**data)
	db.add(db_meter)
	db.commit()
	db.refresh(db_meter)
	return db_meter

@router.put("/{meter_id}", response_model=WaterMeterOut)
def update_meter(meter_id: int, meter: WaterMeterUpdate, db: Session = Depends(database.get_db)):
	db_meter = db.query(models.WaterMeter).filter(models.WaterMeter.meter_id == meter_id).first()
	if not db_meter:
		raise HTTPException(status_code=404, detail="Meter not found")
	for key, value in meter.dict(exclude_unset=True).items():
		setattr(db_meter, key, value)
	db.commit()
	db.refresh(db_meter)
	return db_meter

@router.delete("/{meter_id}", response_model=dict)
def delete_meter(meter_id: int, db: Session = Depends(database.get_db)):
	db_meter = db.query(models.WaterMeter).filter(models.WaterMeter.meter_id == meter_id).first()
	if not db_meter:
		raise HTTPException(status_code=404, detail="Meter not found")
	db.delete(db_meter)
	db.commit()
	return {"message": "Meter deleted successfully"}

@router.post("/filter", response_model=PaginatedWaterMeterOut)
def filter_water_meters(
	request: FilterRequest,
	db: Session = Depends(database.get_db),
	page: int = Query(1, ge=1),
	page_size: int = Query(20, ge=1, le=200),
):
	query = db.query(models.WaterMeter)
	valid_filters = {
		"month": (models.WaterMeter.month, date),
		"room_id": (models.WaterMeter.room_id, int),
		"old_reading": (models.WaterMeter.old_reading, int),
		"new_reading": (models.WaterMeter.new_reading, int),
		"water_rate": (models.WaterMeter.water_rate, float),
		"usage_m3": (models.WaterMeter.usage_m3, int),
		"total_amount": (models.WaterMeter.total_amount, float),
		"room_number": (models.Room.room_number, str)
	}
	for f in request.filters:
		col_type = valid_filters.get(f.field)
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
