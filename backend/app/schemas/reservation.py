from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReservationBase(BaseModel):
    contact_phone: str
    room_id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    status: Optional[str] = "Pending"

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    contact_phone: Optional[str] = None
    room_id: Optional[int] = None
    user_id: Optional[int] = None
    status: Optional[str] = None

class ReservationOut(BaseModel):
    reservation_id: int
    
    contact_phone: str
    room_id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedReservationOut(BaseModel):
    items: List[ReservationOut]
    total: int
    class Config:
        orm_mode = True


class Filter(BaseModel):
    field: str
    operator: str
    value: str
class FilterRequest(BaseModel):
    filters: List[Filter] = []   # ⚠️ tránh dùng Optional[List] = [] vì default mutable