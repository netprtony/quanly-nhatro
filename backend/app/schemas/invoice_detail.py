from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class InvoiceDetailBase(BaseModel):
    invoice_id: int
    meter_id: Optional[int] = None
    fee_type: str
    amount: Decimal
    note: Optional[str] = None

class InvoiceDetailCreate(InvoiceDetailBase):
    pass

class InvoiceDetailUpdate(BaseModel):
    meter_id: Optional[int] = None
    fee_type: Optional[str] = None
    amount: Optional[Decimal] = None
    note: Optional[str] = None

class InvoiceDetailOut(InvoiceDetailBase):
    detail_id: int

    class Config:
        orm_mode = True