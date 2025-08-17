from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, database  # ✅ Import tuyệt đối

router = APIRouter(prefix="/roomtypes", tags=["RoomTypes"])

# Lấy tất cả RoomType
@router.get("/", response_model=List[schemas.RoomTypeSchema])
def get_room_types(db: Session = Depends(database.get_db)):
    return db.query(models.RoomType).all()


# Tạo mới RoomType
@router.post("/", response_model=schemas.RoomTypeSchema)
def create_room_type(room_type: schemas.RoomTypeCreate, db: Session = Depends(database.get_db)):
    db_room_type = models.RoomType(**room_type.dict())
    db.add(db_room_type)
    db.commit()
    db.refresh(db_room_type)
    return db_room_type


# Lấy RoomType theo id
@router.get("/{room_type_id}", response_model=schemas.RoomTypeSchema)
def get_room_type(room_type_id: int, db: Session = Depends(database.get_db)):
    db_room_type = db.query(models.RoomType).filter(models.RoomType.room_type_id == room_type_id).first()
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    return db_room_type


# Cập nhật RoomType
@router.put("/{room_type_id}", response_model=schemas.RoomTypeSchema)
def update_room_type(room_type_id: int, room_type: schemas.RoomTypeCreate, db: Session = Depends(database.get_db)):
    db_room_type = db.query(models.RoomType).filter(models.RoomType.room_type_id == room_type_id).first()
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Room type not found")

    for key, value in room_type.dict().items():
        setattr(db_room_type, key, value)

    db.commit()
    db.refresh(db_room_type)
    return db_room_type


# Xóa RoomType
@router.delete("/{room_type_id}", response_model=dict)
def delete_room_type(room_type_id: int, db: Session = Depends(database.get_db)):
    db_room_type = db.query(models.RoomType).filter(models.RoomType.room_type_id == room_type_id).first()
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Room type not found")

    db.delete(db_room_type)
    db.commit()
    return {"message": "Room type deleted successfully"}
