from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.room import RoomSchema


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
    room: Optional[RoomSchema] = None   # 👈 chỉnh lại

    class Config:
        from_attributes = True


class PaginatedDevicesOut(BaseModel):
    items: List[DeviceOut]
    total: int

    class Config:
        from_attributes = True


class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = Field(default_factory=list)   # 👈 tránh mutable default
