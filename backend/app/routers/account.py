import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app import database, utils, models
from app.models import User
from app.schemas.user import UserOut, UserCreate, UserUpdate, PaginatedUserOut, FilterRequest

router = APIRouter(prefix="/accounts", tags=["Accounts"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy danh sách tài khoản (có phân trang, tìm kiếm, sort)
@router.get("/", response_model=PaginatedUserOut)
def get_accounts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    page_size: int = Query(20, ge=1, le=200, description="Số item mỗi trang"),
    search: str = Query(None, description="Tìm kiếm theo username hoặc email"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    # thêm xử lý sort
    valid_sort_fields = {
        "id": User.id,
        "username": User.username,
        "email": User.email,
        "role": User.role,
        "is_active": User.is_active,
        "created_at": User.created_at,
        "updated_at": User.updated_at,
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

# Lấy chi tiết tài khoản theo id
@router.get("/{user_id}", response_model=UserOut)
def get_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Tạo tài khoản mới
@router.post("/", response_model=UserOut, status_code=201)
def create_account(user: UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra email đã tồn tại
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    # Kiểm tra username đã tồn tại
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user = User(
        username=user.username,
        email=user.email,
        password=utils.hash_password(user.password),
        tenant_id=user.tenant_id,
        role=user.role if hasattr(user, "role") else "USER",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Cập nhật tài khoản
@router.put("/{user_id}", response_model=UserOut)
def update_account(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.tenant_id is not None:
        db_user.tenant_id = user.tenant_id  # Phải có dòng này!

    if user.username and user.username != db_user.username:
        if db.query(User).filter(User.username == user.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")
        db_user.username = user.username

    if user.email and user.email != db_user.email:
        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(status_code=400, detail="Email already exists")
        db_user.email = user.email

    if user.role:
        db_user.role = user.role
    if user.is_active is not None:
        db_user.is_active = user.is_active

    db.commit()
    db.refresh(db_user)
    return db_user

# Xóa tài khoản
@router.delete("/{user_id}", response_model=dict)
def delete_account(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Bộ lọc nâng cao
@router.post("/filter", response_model=PaginatedUserOut)
def filter_users(
    request: FilterRequest,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(User)

    # Map field hợp lệ
    valid_fields = {
        "id": (User.id, int),
        "username": (User.username, str),
        "email": (User.email, str),
        "role": (User.role, str),
        "is_active": (User.is_active, bool),
        "created_at": (User.created_at, datetime.datetime),
        "updated_at": (User.updated_at, datetime.datetime)
    }

    for f in request.filters:
        col_type = valid_fields.get(f.field)
        if not col_type:
            continue

        col, py_type = col_type

        # ép kiểu value
        try:
            if py_type == bool:
                val = str(f.value).lower() in ("true", "1", "yes")
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
    return {"items": items, "total": total}
