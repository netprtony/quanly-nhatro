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
    return db.query(models.Room).all()

# ✅ Get single room
@router.get("/{room_id}", response_model=schemas.RoomSchema)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# ✅ Create a new room
@router.post("/", response_model=schemas.RoomSchema, status_code=status.HTTP_201_CREATED)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

# ✅ Update room
@router.put("/{room_id}", response_model=schemas.RoomSchema)
def update_room(room_id: int, room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    for key, value in room.dict().items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room

# ✅ Delete room
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(db_room)
    db.commit()
    return
