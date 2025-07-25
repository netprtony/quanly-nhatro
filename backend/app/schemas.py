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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo



class RoomTypeSchema(BaseModel):
    room_type_id: int
    type_name: str
    description: Optional[str]
    price_per_month: float

    class Config:
        from_attributes = True
        
class RoomCreate(BaseModel):
    room_number: str
    max_occupants: int
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]
    room_type_id: int
class RoomSchema(BaseModel):
    room_id: int
    room_number: str
    max_occupants: int
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]
    room_type: RoomTypeSchema   # <-- Thêm quan hệ room_type vào đây

    class Config:
        from_attributes = True
# ✅ Schema khi tạo hoặc cập nhật phòng
class RoomCreateUpdateSchema(BaseModel):
    room_number: str
    max_occupants: int
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]
    room_type_id: int