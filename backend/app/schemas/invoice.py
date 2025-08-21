from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class InvoiceBase(BaseModel):
    room_id: int
    month: date
    total_amount: float
    is_paid: Optional[bool] = False

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    room_id: Optional[int] = None
    month: Optional[date] = None
    total_amount: Optional[float] = None
    is_paid: Optional[bool] = None

class InvoiceOut(InvoiceBase):
    invoice_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class PaginatedInvoiceOut(BaseModel):
    items: List[InvoiceOut]
    total: int

    class Config:
        orm_mode = True