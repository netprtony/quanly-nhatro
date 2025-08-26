from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# Base dùng cho create/update
class InvoiceBase(BaseModel):
    room_id: int
    month: date
    total_amount: Optional[float] = None
    is_paid: Optional[bool] = False
    

class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    room_id: Optional[int] = None
    month: Optional[date] = None
    total_amount: Optional[float] = None
    is_paid: Optional[bool] = None


# Schema trả về
class InvoiceOut(InvoiceBase):
    invoice_id: int
    created_at: datetime

    class Config:
        orm_mode = True


# Schema phân trang
class PaginatedInvoiceOut(BaseModel):
    items: List[InvoiceOut]
    total: int

    class Config:
        orm_mode = True


# Schema cho filter nâng cao
class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = []   # ⚠️ tránh dùng Optional[List] = [] vì default mutable


class UnpaidInvoiceOut(BaseModel):
    invoice_id: int
    room_number: str
    month: date   # hoặc str nếu muốn format "YYYY-MM"
    total_amount: float

    class Config:
        orm_mode = True
