from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app import models, database
from app.schemas.notification import NotificationOut
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy tất cả thông báo theo user_id sử dụng queue (pagination)

@router.get("/user/{user_id}", response_model=List[NotificationOut])
def get_notifications_by_user(
    user_id: int,
    skip: int = Query(0, ge=0, description="Số lượng thông báo bỏ qua"),
    limit: int = Query(10, gt=0, le=100, description="Số lượng thông báo trả về"),
    db: Session = Depends(get_db)
):
    notis = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notis

# Lấy tất cả thông báo cho admin (user_id là NULL hoặc 0)
@router.get("/admin", response_model=List[NotificationOut])
def get_notifications_for_admin(db: Session = Depends(get_db)):
    notis = db.query(models.Notification).filter((models.Notification.user_id == None) | (models.Notification.user_id == 0)).order_by(models.Notification.created_at.desc()).all()
    return notis

@router.put("/read/{notification_id}", response_model=NotificationOut)
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    noti = db.query(models.Notification).filter(models.Notification.notification_id == notification_id).first()
    if not noti:
        raise HTTPException(status_code=404, detail="Notification not found")
    noti.is_read = True
    db.commit()
    db.refresh(noti)
    return noti

@router.get("/user/{user_id}/unread-count", response_model=int)
def get_unread_notification_count(user_id: int, db: Session = Depends(get_db)):
    count = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id, models.Notification.is_read == False)
        .count()
    )
    return count

@router.get("/admin/reservation", response_model=List[NotificationOut])
def get_reservation_notifications_for_admin(db: Session = Depends(get_db)):
    notis = (
        db.query(models.Notification)
        .filter(
            ((models.Notification.user_id == None) | (models.Notification.user_id == 0)),
            models.Notification.title.ilike("Đặt phòng%")
        )
        .order_by(models.Notification.created_at.desc())
        .all()
    )
    return notis