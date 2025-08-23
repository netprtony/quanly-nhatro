from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentOut, PaginatedPaymentOut,FilterRequest
router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/", response_model=PaginatedPaymentOut)
def get_payments(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo mã hóa đơn, phương thức, hoặc tên khách thuê")
):
    # Join bảng
    query = (
        db.query(
            models.Payment,
            models.Tenant.full_name.label("tenant_name")
        )
        .join(models.Invoice, models.Payment.invoice_id == models.Invoice.invoice_id)
        .join(models.Contract, models.Invoice.room_id == models.Contract.room_id)
        .join(models.Tenant, models.Contract.tenant_id == models.Tenant.tenant_id)
        .filter(models.Contract.contract_status == "Active")  # chỉ lấy hợp đồng đang hiệu lực
    )

    # Điều kiện tìm kiếm
    if search:
        query = query.filter(
            (models.Payment.invoice_id.cast(String).ilike(f"%{search}%")) |
            (models.Payment.payment_method.ilike(f"%{search}%")) |
            (models.Tenant.full_name.ilike(f"%{search}%"))
        )

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    # Trả về dữ liệu chuẩn
    result = []
    for payment, tenant_name in items:
        result.append({
            "payment_id": payment.payment_id,
            "invoice_id": payment.invoice_id,
            "paid_amount": payment.paid_amount,
            "payment_date": payment.payment_date,
            "payment_method": payment.payment_method,
            "transaction_reference": payment.transaction_reference,
            "note": payment.note,
            "tenant_name": tenant_name
        })

    return {"items": result, "total": total}

@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int, db: Session = Depends(database.get_db)):
    payment = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/", response_model=PaymentOut, status_code=201)
def create_payment(payment: PaymentCreate, db: Session = Depends(database.get_db)):
    db_payment = models.Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.put("/{payment_id}", response_model=PaymentOut)
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(database.get_db)):
    db_payment = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    for key, value in payment.dict(exclude_unset=True).items():
        setattr(db_payment, key, value)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.delete("/{payment_id}", response_model=dict)
def delete_payment(payment_id: int, db: Session = Depends(database.get_db)):
    db_payment = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(db_payment)
    db.commit()
    return {"message": "Payment deleted successfully"}

def filter_payment(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Invoice)

    # Map field hợp lệ
    valid_fields = {
        "invoice_id": (models.Payment.invoice_id, str),
        "month": (models.Payment.month, date),
        "paid_amount": (models.Payment.paid_amount, float),
        "payment_method": (models.Payment.payment_method, str),
        "transaction_reference": (models.Payment.transaction_reference, str),
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