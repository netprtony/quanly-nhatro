from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class TenantBase(BaseModel):
    tenant_id: Optional[str]
    full_name: str
    gender: Optional[str] = "Other"
    date_of_birth: Optional[date]
    phone_number: Optional[str]
    id_card_front_path: Optional[str]
    id_card_back_path: Optional[str]
    avatar_path: Optional[str]  # Thêm dòng này
    tenant_status: Optional[str] = "Pending"   # Thêm dòng này
    address: Optional[str]

class TenantCreate(TenantBase):
    tenant_id: str

class TenantUpdate(TenantBase):
    pass

class TenantOut(TenantBase):
    tenant_id: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
# Schema phân trang
class PaginatedTenantOut(BaseModel):
    items: List[TenantOut]
    total: int

    class Config:
        from_attributes = True
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
    id_card_front_path: Optional[str]
    id_card_back_path: Optional[str]
    avatar_path : Optional[str]  # Thêm dòng này
    tenant_status: Optional[str]   # Đã đổi sang tenant_status
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

