from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import database, models, schemas

router = APIRouter(prefix="/rooms", tags=["Rooms"])

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Get all rooms
@router.get("/", response_model=List[schemas.RoomSchema])
def get_all_rooms(db: Session = Depends(get_db)):
    return db.query(models.Room).join(models.RoomType).all()

# ✅ Get single room
@router.get("/{room_id}", response_model=schemas.RoomSchema)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

