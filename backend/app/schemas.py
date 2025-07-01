from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

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
    email: EmailStr
    role: Role
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str




class RoomSchema(BaseModel):
    room_id: int
    room_number: str
    room_type_id: int
    max_occupants: int
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]

    class Config:
        orm_mode = True
class RoomBase(BaseModel):
    room_number: str
    room_type_id: int
    max_occupants: Optional[int] = 1
    is_available: Optional[bool] = True
    floor_number: Optional[int] = None
    description: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomSchema(RoomBase):
    room_id: int

    class Config:
        orm_mode = True