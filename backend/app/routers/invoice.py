from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, database
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceOut, PaginatedInvoiceOut, FilterRequest, UnpaidInvoiceOut
from datetime import date, datetime
from typing import List

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("/", response_model=PaginatedInvoiceOut)
def get_invoices(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng hoặc tháng"), 
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = db.query(models.Invoice)
    if search:
        query = query.join(models.Room).filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (models.Invoice.month.ilike(f"%{search}%")) |
            (models.Invoice.total_amount.ilike(f"%{search}%"))
        )
    valid_sort_fields = {
        "room_id": models.Invoice.room_id,
        "invoice_id": models.Invoice.invoice_id,
        "total_amount": models.Invoice.total_amount,
        "is_paid": models.Invoice.is_paid,
        "created_at": models.Invoice.created_at,
    }
    if sort_field in valid_sort_fields:
        col = valid_sort_fields[sort_field]
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

@router.get("/unpaid-invoices", response_model=List[UnpaidInvoiceOut])
def get_unpaid_invoices(db: Session = Depends(database.get_db)):
    invoices = (
        db.query(
            models.Invoice.invoice_id,
            models.Room.room_number,
            models.Invoice.month,
            models.Invoice.total_amount
        )
        .join(models.Room, models.Invoice.room_id == models.Room.room_id)
        .filter(models.Invoice.is_paid == False)
        .all()
    )
    return invoices
@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(database.get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("/", response_model=InvoiceOut, status_code=201)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(database.get_db)):
    db_invoice = models.Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # Thêm chi tiết hóa đơn loại Rent
    # Lấy giá thuê phòng từ RoomTypes
    room = db.query(models.Room).filter(models.Room.room_id == db_invoice.room_id).first()
    if room:
        room_type = db.query(models.RoomType).filter(models.RoomType.room_type_id == room.room_type_id).first()
        if room_type:
            rent_price = room_type.price_per_month
            rent_detail = models.InvoiceDetail(
                invoice_id=db_invoice.invoice_id,
                fee_type="Rent",
                amount=rent_price,
                note=f"Tiền thuê phòng tháng {db_invoice.month.strftime('%m/%Y')}"
            )
            db.add(rent_detail)
            db.commit()
    return db_invoice

@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, invoice: InvoiceUpdate, db: Session = Depends(database.get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    for key, value in invoice.dict(exclude_unset=True).items():
        setattr(db_invoice, key, value)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.delete("/{invoice_id}", response_model=dict)
def delete_invoice(invoice_id: int, db: Session = Depends(database.get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(db_invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}

@router.post("/filter", response_model=PaginatedInvoiceOut)
def filter_invoices(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Invoice)

    # Map field hợp lệ
    valid_fields = {
        "room_id": (models.Invoice.room_id, int),
        "month": (models.Invoice.month, date),
        "total_amount": (models.Invoice.total_amount, float),
        "is_paid": (models.Invoice.is_paid, bool),
        "created_at": (models.Invoice.created_at, datetime),
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

