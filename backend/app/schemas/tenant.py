from pydantic import BaseModel
from typing import Optional
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