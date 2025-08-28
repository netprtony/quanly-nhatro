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

router = APIRouter(prefix="/payments", tags=["Payments"])


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
            # models.Contract.contract_status == "Active",
            # models.Invoice.created_at >= models.Contract.start_date,
            # (models.Contract.end_date.is_(None)) | (models.Invoice.created_at <= models.Contract.end_date)
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

@router.post("/momo-payment")
def momo_payment(
    amount: int,
    order_info: str = "pay with MoMo",
    redirect_url: str = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b",
    ipn_url: str = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b",
    payment_code: str = "",
    auto_capture: bool = True,
    lang: str = "vi"
):
    accessKey = 'F8BBA842ECF85'
    secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
    partnerCode = 'MOMO'
    requestType = "payWithMethod"
    extraData = ''
    orderGroupId = ''
    storeId = "MomoTestStore"
    partnerName = "Test"

    orderId = partnerCode + str(int(datetime.datetime.now().timestamp() * 1000))
    requestId = orderId

    # Tạo raw signature
    rawSignature = (
        f"accessKey={accessKey}"
        f"&amount={amount}"
        f"&extraData={extraData}"
        f"&ipnUrl={ipn_url}"
        f"&orderId={orderId}"
        f"&orderInfo={order_info}"
        f"&partnerCode={partnerCode}"
        f"&redirectUrl={redirect_url}"
        f"&requestId={requestId}"
        f"&requestType={requestType}"
    )

    # Tạo chữ ký HMAC SHA256
    signature = hmac.new(
        secretKey.encode('utf-8'),
        rawSignature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    requestBody = {
        "partnerCode": partnerCode,
        "partnerName": partnerName,
        "storeId": storeId,
        "requestId": requestId,
        "amount": str(amount),
        "orderId": orderId,
        "orderInfo": order_info,
        "redirectUrl": redirect_url,
        "ipnUrl": ipn_url,
        "lang": lang,
        "requestType": requestType,
        "autoCapture": auto_capture,
        "extraData": extraData,
        "orderGroupId": orderGroupId,
        "signature": signature
    }

    momo_url = "https://test-payment.momo.vn/v2/gateway/api/create"
    headers = {"Content-Type": "application/json"}

    response = requests.post(momo_url, data=json.dumps(requestBody), headers=headers)
    return response.json()


