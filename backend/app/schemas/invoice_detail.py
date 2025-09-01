from typing import List, Optional
from pydantic import BaseModel

class InvoiceDetailBase(BaseModel):
    invoice_id: int
    electricity_meter_id: Optional[int] = None
    water_meter_id: Optional[int] = None
    fee_type: str
    amount: float
    note: Optional[str] = None

class InvoiceDetailCreate(InvoiceDetailBase):
    pass

class InvoiceDetailUpdate(BaseModel):
    electricity_meter_id: Optional[int] = None
    water_meter_id: Optional[int] = None
    fee_type: Optional[str] = None
    amount: Optional[float] = None
    note: Optional[str] = None

class InvoiceDetailOut(InvoiceDetailBase):
    detail_id: int
    invoice_id: int
    electricity_meter_id: Optional[int] = None
    water_meter_id: Optional[int] = None
    fee_type: str
    amount: float
    note: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedInvoiceDetail(BaseModel):
    items: List[InvoiceDetailOut]
    total: int

    class Config:
        from_attributes = True