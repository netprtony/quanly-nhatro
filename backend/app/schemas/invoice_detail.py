from pydantic import BaseModel
from typing import Optional

class InvoiceDetailBase(BaseModel):
    invoice_id: int
    meter_id: Optional[int] = None
    fee_type: str
    amount: float
    note: Optional[str] = None

class InvoiceDetailCreate(InvoiceDetailBase):
    pass

class InvoiceDetailUpdate(BaseModel):
    meter_id: Optional[int] = None
    fee_type: Optional[str] = None
    amount: Optional[float] = None
    note: Optional[str] = None

class InvoiceDetailOut(InvoiceDetailBase):
    detail_id: int

    class Config:
        orm_mode = True