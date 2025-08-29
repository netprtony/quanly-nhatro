from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class WaterMeterBase(BaseModel):
	room_id: int
	month: date
	old_reading: int
	new_reading: int
	water_rate: Optional[float] = 15000
	usage_m3: Optional[int] = None

class WaterMeterCreate(BaseModel):
	room_id: int
	month: date
	old_reading: int
	new_reading: int
	water_rate: Optional[float] = 15000.0

class WaterMeterUpdate(BaseModel):
	room_id: Optional[int] = None
	month: Optional[date] = None
	old_reading: Optional[int] = None
	new_reading: Optional[int] = None
	water_rate: Optional[float] = None
	usage_m3: Optional[int] = None
	total_amount: Optional[float] = None

class WaterMeterOut(BaseModel):
	meter_id: int
	room_id: int
	month: date
	old_reading: int
	new_reading: int
	water_rate: float
	usage_m3: int
	total_amount: float
	created_at: datetime

	class Config:
		orm_mode = True

class PaginatedWaterMeterOut(BaseModel):
	total: int
	items: List[WaterMeterOut]

	class Config:
		orm_mode = True

class Filter(BaseModel):
	field: str
	operator: str
	value: str

class FilterRequest(BaseModel):
	filters: List[Filter] = []
