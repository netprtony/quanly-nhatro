from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationOut

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/", response_model=List[ReservationOut])
def get_reservations(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Tìm theo số điện thoại hoặc số phòng")
):
    query = db.query(models.Reservation)
    if search:
        query = query.join(models.Room).filter(
            (models.Reservation.contact_phone.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: int, db: Session = Depends(database.get_db)):
    reservation = db.query(models.Reservation).filter(models.Reservation.reservation_id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.post("/", response_model=ReservationOut, status_code=201)
def create_reservation(reservation: ReservationCreate, db: Session = Depends(database.get_db)):
    db_reservation = models.Reservation(**reservation.dict())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

@router.put("/{reservation_id}", response_model=ReservationOut)
def update_reservation(reservation_id: int, reservation: ReservationUpdate, db: Session = Depends(database.get_db)):
    db_reservation = db.query(models.Reservation).filter(models.Reservation.reservation_id == reservation_id).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    for key, value in reservation.dict(exclude_unset=True).items():
        setattr(db_reservation, key, value)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

@router.delete("/{reservation_id}", response_model=dict)
def delete_reservation(reservation_id: int, db: Session = Depends(database.get_db)):
    db_reservation = db.query(models.Reservation).filter(models.Reservation.reservation_id == reservation_id).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db.delete(db_reservation)
    db.commit()
    return {"message": "Reservation deleted successfully"}