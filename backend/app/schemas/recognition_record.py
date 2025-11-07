from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RecognitionRecordBase(BaseModel):
    tenant_id: str
    image_path: Optional[str] = None
    status: str  # "Check-in" hoặc "Check-out"
    method: Optional[str] = "Face Recognition"

class RecognitionRecordCreate(RecognitionRecordBase):
    pass

class RecognitionRecordOut(RecognitionRecordBase):
    record_id: int
    timestamp: datetime

    class Config:
        orm_mode = True