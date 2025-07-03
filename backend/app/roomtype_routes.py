from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, database

router = APIRouter(prefix="/roomtypes", tags=["RoomTypes"])

@router.get("/", response_model=List[schemas.RoomTypeSchema])
def get_room_types(db: Session = Depends(database.get_db)):
    return db.query(models.RoomType).all()

@router.post("/", response_model=schemas.RoomTypeSchema)
def create_room_type(room_type: schemas.RoomTypeSchema, db: Session = Depends(database.get_db)):
    db_room_type = models.RoomType(**room_type.dict())
    db.add(db_room_type)
    db.commit()
    db.refresh(db_room_type)
    return db_room_type
