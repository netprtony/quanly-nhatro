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
    payment_date: datetime

    class Config:
        orm_mode = True

class PaginatedPaymentOut(BaseModel):
    items: List[PaymentOut]
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