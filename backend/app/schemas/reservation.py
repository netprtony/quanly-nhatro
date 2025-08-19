from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationBase(BaseModel):
    contact_phone: str
    room_id: int
    user_id: Optional[int] = None
    status: Optional[str] = "Pending"

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    contact_phone: Optional[str] = None
    room_id: Optional[int] = None
    user_id: Optional[int] = None
    status: Optional[str] = None

class ReservationOut(ReservationBase):
    reservation_id: int
    created_at: datetime

    class Config:
        from_attributes = True
