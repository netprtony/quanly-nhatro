from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database

router = APIRouter(prefix="/rooms", tags=["Rooms"])

# ✅ Get all rooms
@router.get("/", response_model=List[schemas.RoomSchema])
def get_all_rooms(db: Session = Depends(database.get_db)):
    return db.query(models.Room).join(models.RoomType).all()

# ✅ Get single room
@router.get("/{room_id}", response_model=schemas.RoomSchema)
def get_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# ✅ Create a new room
@router.post("/", response_model=schemas.RoomSchema)
def create_room(room: schemas.RoomCreate, db: Session = Depends(database.get_db)):
    new_room = models.Room(**room.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

# ✅ Update existing room
@router.put("/{room_id}", response_model=schemas.RoomSchema)
def update_room(room_id: int, room_data: schemas.RoomCreate, db: Session = Depends(database.get_db)):
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