import shutil
from fastapi import APIRouter, Depends, HTTPException, Query,  UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.roomImage import RoomImageCreate, RoomImageOut
import os
from uuid import uuid4
router = APIRouter(prefix="/room-images", tags=["RoomImages"])

@router.get("/", response_model=List[RoomImageOut])
def get_room_images(
    db: Session = Depends(database.get_db),
    room_id: int = Query(None, description="Lọc theo phòng")
):
    query = db.query(models.RoomImage)
    if room_id:
        query = query.filter(models.RoomImage.room_id == room_id)
    return query.all()

@router.get("/{image_id}", response_model=RoomImageOut)
def get_room_image(image_id: int, db: Session = Depends(database.get_db)):
    image = db.query(models.RoomImage).filter(models.RoomImage.image_id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Room image not found")
    return image

@router.post("/", response_model=RoomImageOut, status_code=201)
def create_room_image(room_image: RoomImageCreate, db: Session = Depends(database.get_db)):
    db_image = models.RoomImage(**room_image.dict())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.put("/{image_id}", response_model=RoomImageOut)
def update_room_image(image_id: int, room_image: RoomImageCreate, db: Session = Depends(database.get_db)):
    db_image = db.query(models.RoomImage).filter(models.RoomImage.image_id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Room image not found")
    for key, value in room_image.dict(exclude_unset=True).items():
        setattr(db_image, key, value)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/{image_id}", response_model=dict)
def delete_room_image(image_id: int, db: Session = Depends(database.get_db)):
    db_image = db.query(models.RoomImage).filter(models.RoomImage.image_id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Room image not found")
    db.delete(db_image)
    db.commit()
    return {"message": "Room image deleted successfully"}

UPLOAD_DIR = "public/roomImage"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif"}
@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # ✅ kiểm tra MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Chỉ được upload file ảnh (jpg, png, gif)")

    # ✅ kiểm tra đuôi file
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ")

    # ✅ giữ nguyên tên file gốc
    filename = file.filename
    save_path = os.path.join(UPLOAD_DIR, filename)

    # Nếu chưa có thư mục thì tạo
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # ✅ copy file vào thư mục public/roomImage
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Trả về đường dẫn ảnh cho FE
    return {"image_path": f"/{UPLOAD_DIR}/{filename}"}