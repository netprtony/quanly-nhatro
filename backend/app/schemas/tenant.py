from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class TenantBase(BaseModel):
    full_name: str
    gender: Optional[str] = "Other"
    date_of_birth: Optional[date]
    phone_number: Optional[str]
    email: Optional[str]
    id_card_front_path: Optional[str]
    id_card_back_path: Optional[str]
    is_rent: Optional[bool] = True
    address: Optional[str]

class TenantCreate(TenantBase):
    tenant_id: str

class TenantUpdate(TenantBase):
    pass

class TenantOut(TenantBase):
    tenant_id: str
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
# Schema phân trang
class PaginatedTenantOut(BaseModel):
    items: List[TenantOut]
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

class TenantResponse(BaseModel):
    tenant_id: str
    full_name: str
    gender: Optional[str]
    date_of_birth: Optional[date]
    phone_number: Optional[str]
    email: Optional[str]
    id_card_front_path: Optional[str]
    id_card_back_path: Optional[str]
    is_rent: Optional[bool]
    address: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True