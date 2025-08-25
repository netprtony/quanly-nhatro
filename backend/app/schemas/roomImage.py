from pydantic import BaseModel


class RoomImageBase(BaseModel):
    image_path: str


class RoomImageCreate(RoomImageBase):
    room_id: int  # khi tạo cần chỉ định phòng


class RoomImageOut(RoomImageBase):
    image_id: int
    room_id: int

    class Config:
        from_attributes = True  # để mapping từ SQLAlchemy model
