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
    num_people: Optional[int] = 1
    num_vehicles: Optional[int] = 0
    contract_status: Optional[str] = "Active"
    path_contract: Optional[str] = None

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    tenant_id: Optional[str] = None
    room_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    deposit_amount: Optional[float] = None
    num_people: Optional[int] = None
    num_vehicles: Optional[int] = None
    monthly_rent: Optional[float] = None
    contract_status: Optional[str] = None
    path_contract: Optional[str] = None

class ContractOut(ContractBase):
    contract_id: int
    created_at: datetime

    class Config:
        from_attributes = True
class PaginatedContract(BaseModel):
    items: List[ContractOut]
    total: int

    class Config:
        from_attributes = True

class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = [] 

class ContractDetailOut(BaseModel):
    path_contract: Optional[str] = None