from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app import database, utils
from app.models import User
from app.schemas import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/accounts", tags=["Accounts"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy danh sách tài khoản (có phân trang, tìm kiếm)
@router.get("/", response_model=List[UserOut])
def get_accounts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Tìm kiếm theo username hoặc email")
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

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
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = utils.hash_password(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_pw,
        role=user.role if hasattr(user, "role") else "user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Cập nhật tài khoản
@router.put("/{user_id}", response_model=UserOut)
def update_account(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

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
