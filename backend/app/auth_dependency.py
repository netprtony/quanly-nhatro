from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, utils, database
from app.models import User
from app.schemas import UserLogin, TokenResponse, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = utils.hash_password(user.password)
    new_user = User(username=user.username, email=user.email, password=hashed_pw)
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

@router.post("/change-password", response_model=schemas.UserOut)
def change_password(
    user: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(utils.get_current_user)
):
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not utils.verify_password(user.old_password, db_user.password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    hashed_new_pw = utils.hash_password(user.new_password)
    db_user.password = hashed_new_pw
    db.commit()
    db.refresh(db_user)
    return db_user
