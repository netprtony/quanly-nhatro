from pydantic import BaseModel
from typing import Optional, List

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
    room_type_id: int
    room_number: str
    max_occupants: int
    image_count: int = 0
    is_available: bool
    floor_number: Optional[int]
    description: Optional[str]
    room_type: RoomTypeSchema
    roomImage: List[str] = []   # Thêm dòng này

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
class PaginatedRoomOut(BaseModel):
    items: List[RoomSchema]
    total: int

    class Config:
        orm_mode = True
class PaginatedRoomTypeOut(BaseModel):
    items: List[RoomTypeSchema]
    total: int

    class Config:
        orm_mode = True

class Filter(BaseModel):
    field: str
    operator: str
    value: str


class FilterRequest(BaseModel):
    filters: List[Filter] = [] 

class RoomRequestSchema(BaseModel):
    room_id: int
    room_number: str
    type_name: str                # Thêm dòng này
    price_per_month: float        # Thêm dòng này