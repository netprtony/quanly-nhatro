from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DeviceBase(BaseModel):
    device_name: str
    room_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    room_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class DeviceOut(DeviceBase):
    device_id: int
    created_at: datetime

    class Config:
        orm_mode = True
class PaginatedDevices(BaseModel):
    items: List[DeviceOut]
    total: int

    class Config:
        orm_mode = True