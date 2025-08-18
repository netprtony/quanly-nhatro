from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import Query
from typing import List
from . import models, schemas, utils, database
from app.schemas import UserLogin, TokenResponse, UserOut, UserCreate, UserUpdate
router = APIRouter(prefix="/auth", tags=["Authentication"])
from app.models import User
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = utils.hash_password(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not utils.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive account")

    token = utils.create_access_token(data={"sub": db_user.username, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active,
        }
    }

# api đổi mật khẩu
@router.post("/change-password", response_model=schemas.UserOut)
def change_password(
    user: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(utils.get_current_user)
):
    # Truy vấn lại user từ session db
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not utils.verify_password(user.old_password, db_user.password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    hashed_new_pw = utils.hash_password(user.new_password)
    db_user.password = hashed_new_pw
    db.commit()
    db.refresh(db_user)
    return db_user

# API: Lấy danh sách tài khoản (có phân trang, tìm kiếm)
@router.get("/accounts", response_model=List[UserOut])
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

# API: Lấy chi tiết tài khoản theo id
@router.get("/accounts/{user_id}", response_model=UserOut)
def get_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# API: Tạo tài khoản mới (admin)
@router.post("/accounts", response_model=UserOut, status_code=201)
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

# API: Cập nhật tài khoản
@router.put("/accounts/{user_id}", response_model=UserOut)
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

# API: Xóa tài khoản
@router.delete("/accounts/{user_id}", response_model=dict)
def delete_account(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}