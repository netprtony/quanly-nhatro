from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class ContractBase(BaseModel):
    tenant_id: str
    room_id: int
    start_date: date
    end_date: Optional[date] = None
    deposit_amount: Optional[float] = None
    monthly_rent: Optional[float] = None
    contract_status: Optional[str] = "Active"

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    tenant_id: Optional[str] = None
    room_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    deposit_amount: Optional[float] = None
    monthly_rent: Optional[float] = None
    contract_status: Optional[str] = None

class ContractOut(ContractBase):
    contract_id: int
    created_at: datetime

    class Config:
        orm_mode = True
class PaginatedContract(BaseModel):
    items: List[ContractOut]
    total: int

    class Config:
        orm_mode = True

class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = [] 