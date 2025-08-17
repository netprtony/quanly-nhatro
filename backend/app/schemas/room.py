from pydantic import BaseModel
from typing import Optional


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
    room_type: RoomTypeSchema

    class Config:
        from_attributes = True


class RoomCreateUpdateSchema(BaseModel):
    room_number: str
    max_occupants: int
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]
    room_type_id: int
class RoomTypeCreate(BaseModel):
    type_name: str
    description: Optional[str]
    price_per_month: float