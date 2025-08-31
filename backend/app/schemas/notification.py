from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: Optional[int]
    title: str
    message: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationOut(NotificationBase):
    notification_id: int
    created_at: datetime

    class Config:
        orm_mode = True