from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PaymentBase(BaseModel):
    invoice_id: int
    paid_amount: float
    payment_method: Optional[str] = "Cash"
    transaction_reference: Optional[str] = None
    note: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    invoice_id: Optional[int] = None
    paid_amount: Optional[float] = None
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    note: Optional[str] = None

class PaymentOut(PaymentBase):
    payment_id: int
    invoice_id: int
    paid_amount: float
    payment_date: datetime
    payment_method: str
    transaction_reference: Optional[str]
    note: Optional[str]


    class Config:
        orm_mode = True
class PaymentWithRelationsOut(BaseModel):
    payment_id: int
    invoice_id: int
    paid_amount: float
    payment_date: datetime
    payment_method: str
    transaction_reference: Optional[str] = None
    note: Optional[str] = None

    # ✅ Thêm 2 trường join từ bảng khác
    tenant_name: str
    room_number: str

    class Config:
        orm_mode = True

class PaginatedPaymentOut(BaseModel):
    items: List[PaymentWithRelationsOut]
    total: int

    class Config:
        orm_mode = True
# Schema cho filter nâng cao
class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = [] 


class PaymentRequest(BaseModel):
    amount: int
    invoice_id: int  