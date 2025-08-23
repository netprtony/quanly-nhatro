from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, database
from app.schemas.room import PaginatedRoomTypeOut, FilterRequest  # ✅ Import tuyệt đối

router = APIRouter(prefix="/roomtypes", tags=["RoomTypes"])



# Lấy danh sách room_types (có phân trang, tìm kiếm)
@router.get("/", response_model=PaginatedRoomTypeOut)
def get_room_types(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    page_size: int = Query(20, ge=1, le=200, description="Số item mỗi trang"),
    search: str = Query(None, description="Tìm kiếm theo tên hoặc số điện thoại"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.RoomType)
    if search:
        query = query.filter(
            (models.RoomType.type_name.ilike(f"%{search}%")) |
            (models.RoomType.description.ilike(f"%{search}%"))
        )
    # thêm xử lý sort
    valid_sort_fields = {
        "type_name": models.RoomType.type_name,
        "price_per_month": models.RoomType.price_per_month,
    }
    if sort_field in valid_sort_fields:
        col = valid_sort_fields[sort_field]
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())
    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return {"items": items, "total": total}
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

@router.post("/filter", response_model=PaginatedRoomTypeOut)
def filter_room_types(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.RoomType)

    # Map field hợp lệ
    valid_fields = {
        "type_name": (models.RoomType.type_name, str),
        "description": (models.RoomType.description, str),
        "price_per_month": (models.RoomType.price_per_month, float),
    }

    for f in request.filters:
        col_type = valid_fields.get(f.field)
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
