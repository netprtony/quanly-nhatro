from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class ElectricityMeterBase(BaseModel):
    room_id: int
    month: date
    old_reading: int
    new_reading: int
    electricity_rate: Optional[float] = 3500
    usage_kwh: Optional[int] = None

class ElectricityMeterCreate(BaseModel):
    room_id: int
    month: date
    old_reading: int
    new_reading: int
    electricity_rate: Optional[float] = 3500.0

class ElectricityMeterUpdate(BaseModel):
    room_id: Optional[int] = None
    month: Optional[date] = None
    old_reading: Optional[int] = None
    new_reading: Optional[int] = None
    electricity_rate: Optional[float] = None
    usage_kwh: Optional[int] = None
    total_amount: Optional[float] = None

class ElectricityMeterOut(BaseModel):
    meter_id: int
    full_name: str

    room_id: int
    month: date
    old_reading: int
    new_reading: int
    electricity_rate: float
    usage_kwh: int
    total_amount: float
    created_at: datetime

    class Config:
        orm_mode = True

class PaginatedElectricityMeterOut(BaseModel):
    total: int
    items: List[ElectricityMeterOut]

    class Config:
        orm_mode = True