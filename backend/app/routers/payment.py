from datetime import date
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentOut, PaginatedPaymentOut, FilterRequest, PaginatedPaymentOut, PaymentWithRelationsOut, PaymentRequest
import requests
import hmac
import hashlib
import json
import os
from dotenv import load_dotenv
load_dotenv()
router = APIRouter(prefix="/payments", tags=["Payments"])
PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY")
PAYOS_ENDPOINT = "https://api-merchant.payos.vn/v2/payment-requests"
def generate_checksum(data, key):
    raw_data = json.dumps(data, separators=(',', ':'))
    return hmac.new(key.encode('utf-8'), raw_data.encode('utf-8'), hashlib.sha256).hexdigest()

@router.post("/payos")
def create_payment(body: PaymentRequest, db: Session = Depends(database.get_db)):
    amount = int(body.amount)
    invoice_id = body.invoice_id

    # orderCode phải unique (dùng timestamp thay vì invoice_id)
    order_code = int(datetime.datetime.now().timestamp())

    payload = {
        "orderCode": int(invoice_id),  # hoặc order_code, nhưng phải là số nguyên
        "amount": int(amount),
        "currency": "VND",
        "description": f"Thanh toán hóa đơn #{invoice_id}",
        "returnUrl": "http://localhost:3000/payment-success",
        "cancelUrl": "http://localhost:3000/payment-failed"
    }
    payload["checksum"] = generate_checksum(payload, PAYOS_CHECKSUM_KEY)

    headers = {
        "x-client-id": PAYOS_CLIENT_ID,
        "x-api-key": PAYOS_API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(PAYOS_ENDPOINT, headers=headers, json=payload)
    data = response.json()

    # Nếu thành công, cập nhật transaction_reference
    if data.get("code") == "00" and data.get("data"):
        checkout_url = data["data"].get("checkoutUrl")
        transaction_reference = data["data"].get("transactionId")  # field chuẩn PayOS
        invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
        if invoice and transaction_reference:
            invoice.transaction_reference = transaction_reference
            db.commit()

    return data

@router.get("/", response_model=PaginatedPaymentOut)
def get_payments(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo mã hóa đơn, phương thức, tên khách thuê, hoặc số phòng"),
    tenant_id: str = Query(None, description="Lọc theo tenant_id cụ thể"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
):
    query = (
        db.query(
            models.Payment,
            models.Tenant.full_name.label("tenant_name"),
            models.Room.room_number.label("room_number")
        )
        .join(models.Invoice, models.Payment.invoice_id == models.Invoice.invoice_id)
        .join(models.Contract, models.Invoice.room_id == models.Contract.room_id)
        .join(models.Tenant, models.Contract.tenant_id == models.Tenant.tenant_id)
        .join(models.Room, models.Invoice.room_id == models.Room.room_id)
        .filter(
            models.Contract.contract_status == "Active",
            models.Invoice.created_at >= models.Contract.start_date,
            (models.Contract.end_date.is_(None)) | (models.Invoice.created_at <= models.Contract.end_date)
        )
    )

    # lọc theo tenant_id
    if tenant_id:
        query = query.filter(models.Tenant.tenant_id == tenant_id)

    # lọc theo search
    if search:
        query = query.filter(
            (models.Payment.invoice_id.cast(String).ilike(f"%{search}%")) |
            (models.Payment.payment_method.ilike(f"%{search}%")) |
            (models.Tenant.full_name.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )

    # tổng số bản ghi
    total = query.count()

    # sắp xếp
    valid_sort_fields = {
        "payment_id": models.Payment.payment_id,
        "invoice_id": models.Payment.invoice_id,
        "paid_amount": models.Payment.paid_amount,
        "payment_date": models.Payment.payment_date,
        "payment_method": models.Payment.payment_method,
        "transaction_reference": models.Payment.transaction_reference,
        "note": models.Payment.note,
        "tenant_name": models.Tenant.full_name,
        "room_number": models.Room.room_number
    }
    if sort_field in valid_sort_fields:
        sort_col = valid_sort_fields[sort_field]
        query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()

    result = [
        PaymentWithRelationsOut(
            payment_id=payment.payment_id,
            invoice_id=payment.invoice_id,
            paid_amount=payment.paid_amount,
            payment_date=payment.payment_date,
            payment_method=payment.payment_method,
            transaction_reference=payment.transaction_reference,
            note=payment.note,
            tenant_name=tenant_name,
            room_number=room_number
        )
        for payment, tenant_name, room_number in items
    ]

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


