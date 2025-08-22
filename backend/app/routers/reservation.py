from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationOut, PaginatedReservationOut, FilterRequest
router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/", response_model=PaginatedReservationOut)
def get_reservations(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo số điện thoại hoặc số phòng")
):
    query = db.query(models.Reservation)
    if search:
        query = query.join(models.Room).filter(
            (models.Reservation.contact_phone.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

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

@router.post("/filter", response_model=PaginatedReservationOut)
def filter_invoices(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Reservation)

    # Map field hợp lệ
    valid_fields = {
        "reservation_id": (models.Reservation.reservation_id, int),
        "room_id": (models.Reservation.room_id, int),
        "user_id": (models.Reservation.user_id, int),
        "status": (models.Reservation.status, str),
        "contact_phone": (models.Reservation.contact_phone, str),
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