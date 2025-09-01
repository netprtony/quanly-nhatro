from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymysql import IntegrityError, OperationalError
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app import models, utils, database
from app.schemas import room as room_schema
router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/all", response_model=List[room_schema.RoomRequestSchema])
def get_all_rooms(
    filter_is_available: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Room).join(models.RoomType)
    if filter_is_available is not None:
        if filter_is_available.lower() == "true":
            query = query.filter(models.Room.is_available == True)
        elif filter_is_available.lower() == "false":
            query = query.filter(models.Room.is_available == False)
    rooms = query.all()
    result = []
    for room in rooms:
        room_type = db.query(models.RoomType).filter(models.RoomType.room_type_id == room.room_type_id).first()
        room_dict = {
            "room_id": room.room_id,
            "room_number": room.room_number,
            "type_name": room_type.type_name if room_type else "",
            "price_per_month": room_type.price_per_month if room_type else 0.0,
        }
        result.append(room_dict)
    return result
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
    # Truy vấn chính, join RoomType để lấy thông tin loại phòng
    query = db.query(models.Room).join(models.RoomType)

    # Truy vấn đếm tổng số phòng
    count_query = db.query(models.Room).join(models.RoomType)

    # Tìm kiếm
    if search:
        search_lower = search.strip().lower()
        if search_lower in ["trống", "có sẵn", "còn trống"]:
            query = query.filter(models.Room.is_available == True)
            count_query = count_query.filter(models.Room.is_available == True)
        elif search_lower in ["đã thuê", "có người"]:
            query = query.filter(models.Room.is_available == False)
            count_query = count_query.filter(models.Room.is_available == False)
        elif any(kw in search_lower for kw in ["trống", "có sẵn", "còn trống"]):
            query = query.filter(models.Room.is_available == True)
            count_query = count_query.filter(models.Room.is_available == True)
        elif any(kw in search_lower for kw in ["đã thuê", "có người"]):
            query = query.filter(models.Room.is_available == False)
            count_query = count_query.filter(models.Room.is_available == False)
        else:
            query = query.filter(
                (models.Room.room_number.ilike(f"%{search}%")) |
                (models.Room.floor_number.ilike(f"%{search}%")) |
                (models.RoomType.type_name.ilike(f"%{search}%")) |
                (models.RoomType.price_per_month.ilike(f"%{search}%"))
            )
            count_query = count_query.filter(
                (models.Room.room_number.ilike(f"%{search}%")) |
                (models.Room.floor_number.ilike(f"%{search}%")) |
                (models.RoomType.type_name.ilike(f"%{search}%")) |
                (models.RoomType.price_per_month.ilike(f"%{search}%"))
            )

    # Sắp xếp
    valid_sort_fields = {
        "room_number": models.Room.room_number,
        "floor_number": models.Room.floor_number,
        "type_name": models.RoomType.type_name,
        "price_per_month": models.RoomType.price_per_month,
    }
    if sort_field in valid_sort_fields:
        col = valid_sort_fields[sort_field]
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())

    # Đếm tổng số
    total = count_query.count()

    # Phân trang
    rooms = query.offset((page - 1) * page_size).limit(page_size).all()

    # Trả về list image_paths cho từng phòng
    result = []
    for room in rooms:
        room_dict = room_schema.RoomSchema.model_validate(room, from_attributes=True).model_dump()
        # Lấy ảnh trực tiếp từ bảng RoomImage
        images = db.query(models.RoomImage).filter(models.RoomImage.room_id == room.room_id).all()
        room_dict["roomImage"] = [img.image_path for img in images]
        result.append(room_dict)
    return {"items": result, "total": total}
# ✅ Create a new room
@router.post("/", response_model=room_schema.RoomSchema)
def create_room(room: room_schema.RoomCreate, db: Session = Depends(database.get_db)):
    new_room = models.Room(**room.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.put("/{room_id}", response_model=room_schema.RoomSchema)
def update_room(room_id: int, room_data: room_schema.RoomCreate, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    try:
        for field, value in room_data.dict().items():
            setattr(room, field, value)
        db.commit()
        db.refresh(room)
    except OperationalError as e:  
        db.rollback()
        # ✅ Lấy message từ MySQL trigger SIGNAL
        if e.orig.args and len(e.orig.args) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e.orig.args[1])  # "Chỉ được phép sửa room_type_id ..."
            )
        raise HTTPException(status_code=400, detail="Database error")
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Dữ liệu không hợp lệ")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return room


@router.delete("/{room_id}", status_code=204)
def delete_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    try:
        db.delete(room)
        db.commit()
    except OperationalError as e:
        db.rollback()
        if e.orig.args and len(e.orig.args) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e.orig.args[1])  # Thông báo từ trigger
            )
        raise HTTPException(status_code=400, detail="Database error")
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Không thể xóa do ràng buộc dữ liệu")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return None

@router.post("/filter", response_model=room_schema.PaginatedRoomOut)
def filter_rooms(
    request: room_schema.FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200)
):
    query = db.query(models.Room).join(models.RoomType)

    valid_sort_fields = {
        "room_number": (models.Room.room_number, str),
        "floor_number": (models.Room.floor_number, str),
        "type_name": (models.RoomType.type_name, str),
        "price_per_month": (models.RoomType.price_per_month, float),
        "is_available": (models.Room.is_available, bool),
    }

    for f in request.filters:
        # Xử lý đặc biệt cho trường is_available với từ khóa tiếng Việt
        if f.field == "is_available":
            val = f.value.strip().lower()
            empty_keywords = [ "còn trống"]
            rented_keywords = ["đã thuê",]
            if any(kw in val for kw in empty_keywords):
                query = query.filter(models.Room.is_available == True)
                continue
            elif any(kw in val for kw in rented_keywords):
                query = query.filter(models.Room.is_available == False)
                continue
        col_type = valid_sort_fields.get(f.field)
        if not col_type:
            continue
        col, py_type = col_type
        try:
            if py_type == bool:
                val = f.value.lower() in ("true", "1", "yes")
            else:
                val = py_type(f.value)
        except Exception:
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
            if py_type == str:
                query = query.filter(col.ilike(f"%{val}%"))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    # Trả về list image cho từng phòng
    result = []
    for room in items:
        room_dict = room_schema.RoomSchema.model_validate(room, from_attributes=True).model_dump()
        images = db.query(models.RoomImage).filter(models.RoomImage.room_id == room.room_id).all()
        room_dict["roomImage"] = [img.image_path for img in images]
        result.append(room_dict)
    return {"items": result, "total": total}

