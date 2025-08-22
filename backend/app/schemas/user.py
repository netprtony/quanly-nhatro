from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class RoleEnum(str, Enum):
    USER = 'USER'
    ADMIN = 'ADMIN'


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    role: Optional[RoleEnum]
    is_active: Optional[bool]
    password: Optional[str]
    class Config:
        from_attributes = True

class PaginatedUserOut(BaseModel):
    items: List[UserOut]
    total: int
    class Config:
        orm_mode = True

class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = []   # ⚠️ tránh dùng Optional[List] = [] vì default mutable
