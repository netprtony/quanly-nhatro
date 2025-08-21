from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, utils, database
from app.schemas import room as room_schema
router = APIRouter(prefix="/rooms", tags=["Rooms"])

# # ✅ Get all rooms
# @router.get("/", response_model=List[room_schema.RoomSchema])
# def get_all_rooms(db: Session = Depends(database.get_db)):
#     return db.query(models.Room).join(models.RoomType).all()
@router.get("/all", response_model=List[room_schema.RoomSchema])
def get_all_rooms(
    filter_is_available: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Room)
    if filter_is_available is not None:
        if filter_is_available.lower() == "true":
            query = query.filter(models.Room.is_available == True)
        elif filter_is_available.lower() == "false":
            query = query.filter(models.Room.is_available == False)
    return query.all()
# ✅ Get single room
@router.get("/{room_id}", response_model=room_schema.RoomSchema)
def get_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
# ✅ Get all rooms with pagination
@router.get("/", response_model=room_schema.PaginatedRoomOut)
def get_rooms(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo số phòng hoặc tầng")
):
    query = db.query(models.Room).join(models.RoomType)
    if search:
        query = query.filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (models.Room.floor_number.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}
# ✅ Create a new room
@router.post("/", response_model=room_schema.RoomSchema)
def create_room(room: room_schema.RoomCreate, db: Session = Depends(database.get_db)):
    new_room = models.Room(**room.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

# ✅ Update existing room
@router.put("/{room_id}", response_model=room_schema.RoomSchema)
def update_room(room_id: int, room_data: room_schema.RoomCreate, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for field, value in room_data.dict().items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room

# ✅ Delete room
@router.delete("/{room_id}", status_code=204)
def delete_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return None
