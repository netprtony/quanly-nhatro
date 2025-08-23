from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, utils, database
from app.schemas import room as room_schema
router = APIRouter(prefix="/rooms", tags=["Rooms"])

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
    search: str = Query(None, description="Tìm theo số phòng hoặc tầng"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.Room).join(models.RoomType)
    if search:
        query = query.filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (models.Room.floor_number.ilike(f"%{search}%")) |
            (models.RoomType.type_name.ilike(f"%{search}%")) |
            (models.RoomType.price_per_month.ilike(f"%{search}%"))
        )
    valid_sort_fields = {
        "room_number": models.Room.room_number,
        "floor_number": models.Room.floor_number,
        "type_name": models.RoomType.type_name,
        "price_per_month": models.RoomType.price_per_month,
    }
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

@router.post("/filter", response_model=room_schema.PaginatedRoomOut)
def filter_rooms(
    request: room_schema.FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200)
):
    query = db.query(models.Room).join(models.RoomType)

    if request.room_number:
        query = query.filter(models.Room.room_number == request.room_number)
    if request.floor_number:
        query = query.filter(models.Room.floor_number == request.floor_number)
    if request.type_name:
        query = query.filter(models.RoomType.type_name == request.type_name)
    if request.price_per_month:
        query = query.filter(models.RoomType.price_per_month == request.price_per_month)

    valid_sort_fields = {
        "room_number": models.Room.room_number,
        "floor_number": models.Room.floor_number,
        "type_name": models.RoomType.type_name,
        "price_per_month": models.RoomType.price_per_month,
    }
    for f in request.filters:
        col_type = valid_sort_fields.get(f.field)
        if not col_type:
            continue

        col, py_type = col_type

        # ép kiểu value
        try:
            if py_type == bool:
                val = f.value.lower() in ("true", "1", "yes")
            else:
                val = py_type(f.value)
        except Exception:
            # nếu không ép được thì bỏ qua filter này
            continue

        if f.operator == "=":
            query = query.filter(col == val)
        elif f.operator == "!=":
            query = query.filter(col != val)
        elif f.operator == ">":
            query = query.filter(col > val)
        elif f.operator == "<":
            query = query.filter(col < val)
        elif f.operator == ">=":
            query = query.filter(col >= val)
        elif f.operator == "<=":
            query = query.filter(col <= val)
        elif f.operator == "~":
            # chỉ apply LIKE cho chuỗi
            if py_type == str:
                query = query.filter(col.ilike(f"%{val}%"))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}