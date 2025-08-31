from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app import models, database
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceOut, PaginatedInvoiceOut, FilterRequest, UnpaidInvoiceOut
from datetime import date, datetime
from typing import List
import os
from docxtpl import DocxTemplate
from docx2pdf import convert
import pythoncom
from app import utils
import datetime
router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("/", response_model=PaginatedInvoiceOut)
def get_invoices(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng hoặc tháng"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp"),
    tenant_id: str = Query(None, description="Lấy hóa đơn theo tenant_id"),  # Thêm param này
):
    query = db.query(models.Invoice)
    if tenant_id:
        # Join với Contract để lấy hóa đơn của khách thuê
        query = query.join(models.Contract, models.Invoice.room_id == models.Contract.room_id)\
                     .filter(models.Contract.tenant_id == tenant_id)
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
        "room_number": (models.Room.room_number, str)
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

# Đường dẫn gốc backend (dùng cho template)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEMPLATE_PATH = os.path.join(PROJECT_ROOT, "InvoiceFile", "invoice_template.docx")
FE_PUBLIC_INVOICE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "nha-tro-fe", "public", "invoices_file")
)
os.makedirs(FE_PUBLIC_INVOICE_DIR, exist_ok=True)
@router.get("/export/{invoice_id}")
def export_invoice(
    invoice_id: int,
    file_type: str = Query("docx", description="Loại file xuất: docx hoặc pdf"),
    file_name: str = Query(None, description="Tên file xuất, nếu không có sẽ dùng định dạng mặc định"),
    db: Session = Depends(database.get_db),
):
    # Lấy hóa đơn
    invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
    # Lấy chi tiết hóa đơn
    invoice_details = db.query(models.InvoiceDetail)\
        .filter(models.InvoiceDetail.invoice_id == invoice_id)\
        .order_by(models.InvoiceDetail.detail_id.desc())\
        .all()

    # Khởi tạo biến
    oldEM = newEM = electricity_rate = usage_kwh = None
    oldWM = newWM = water_rate = usage_m3 = None

    for detail in invoice_details:
        if detail.fee_type == "Electricity" and detail.electricity_meter_id:
            em = db.query(models.ElectricityMeter).filter(
                models.ElectricityMeter.meter_id == detail.electricity_meter_id
            ).first()
            if em:
                oldEM = em.old_reading
                newEM = em.new_reading
                electricity_rate = em.electricity_rate
                usage_kwh = em.usage_kwh

        elif detail.fee_type == "Water" and detail.water_meter_id:
            wm = db.query(models.WaterMeter).filter(
                models.WaterMeter.meter_id == detail.water_meter_id
            ).first()
            if wm:
                oldWM = wm.old_reading
                newWM = wm.new_reading
                water_rate = wm.water_rate
                usage_m3 = wm.usage_m3
            
            
    if not invoice_details:
        raise HTTPException(status_code=404, detail="Không tìm thấy chi tiết hóa đơn")
    # Lấy hợp đồng để biết thông tin phòng
    contract = db.query(models.Contract).filter(models.Contract.room_id == invoice.room_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng cho phòng này")
    # Lấy thông tin tenant
    tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == contract.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Không tìm thấy người thuê")
    # Lấy thông tin phòng mà khách thuê đang ở
    room = db.query(models.Room).filter(models.Room.room_id == contract.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng cho hợp đồng này")
    # lấy loại phòng theo room_id
    roomType = db.query(models.RoomType).filter(models.RoomType.room_type_id == room.room_type_id).first()
    total_amount = mustPay = invoice.total_amount
    
    deposit_amount = contract.deposit_amount
    if contract.deposit_amount != 0:
        mustPay = invoice.total_amount - contract.deposit_amount
        contract.deposit_amount = 0
    mustPay_read = utils.num2words_vnd(mustPay)
    start_date = datetime.date.today()

   
    
    amountTrash = None
    amountWM = None
    amountEM = None
    amountWifi = None

    for detail in invoice_details:
        if detail.fee_type == "Electricity" and amountEM is None:
            amountEM = detail.amount
        if detail.fee_type == "Water" and amountWM is None:
            amountWM = detail.amount
        if detail.fee_type == "Trash" and amountTrash is None:
            amountTrash = detail.amount
        if detail.fee_type == "Wifi" and amountWifi is None:
            amountWifi = detail.amount
    
    # Nếu không có chi tiết hóa đơn rác và nước thì giữ nguyên là None
    def format_currency(value):
        if value is None:
            return ""
        return "{:,.0f}".format(int(value)).replace(",", ".")

    context = {
        "day": start_date.day,
        "month": start_date.month,
        "year": start_date.year,
        "floor_number": room.floor_number,
        "room_number": room.room_number,
        "tenant_name": tenant.full_name,
        "mustPay_read": mustPay_read,
        "mustPay": format_currency(mustPay),
        "type_name": roomType.type_name,
        "amountRoom": format_currency(roomType.price_per_month),
        "oldEM": int(oldEM) if oldEM is not None else None,
        "newEM": int(newEM) if newEM is not None else None,
        "oldWM": int(oldWM) if oldWM is not None else None,
        "newWM": int(newWM) if newWM is not None else None,
        "amountTrash": format_currency(amountTrash),
        "amountEM": format_currency(amountEM),
        "amountWM": format_currency(amountWM),
        "amountWifi": format_currency(amountWifi),
        "deposit_amount": format_currency(deposit_amount),
        "electricity_rate": format_currency(electricity_rate),
        "water_rate": format_currency(water_rate),
        "usage_kwh": int(usage_kwh) ,
        "usage_m3": int(usage_m3),
        "total_amount": format_currency(total_amount)
    }
    doc = DocxTemplate(TEMPLATE_PATH)
    doc.render(context)

    # Tên file theo yêu cầu FE
    safe_room_number = "".join(room.room_number.split(" "))
    ext = "pdf" if file_type == "pdf" else "docx"
    filename = file_name if file_name else f"invoice_{invoice_id}_{safe_room_number}.{ext}"
    file_path = os.path.join(FE_PUBLIC_INVOICE_DIR, filename)
    doc.save(file_path if ext == "docx" else file_path.replace(".pdf", ".docx"))

    # Nếu là PDF thì chuyển đổi
    if file_type == "pdf":
        
        docx_path = file_path.replace(".pdf", ".docx")
        try:
            pythoncom.CoInitialize()  # Khởi tạo COM cho thread hiện tại
            convert(docx_path, file_path)
            pythoncom.CoUninitialize()  # Giải phóng COM sau khi xong
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi PDF: {str(e)}")
        invoice.path_invoice = f"/invoices_file/{filename}"
        db.commit()
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    else:
        invoice.path_invoice = f"/invoices_file/{filename}"
        db.commit()
        return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=filename)