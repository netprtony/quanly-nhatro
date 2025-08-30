from datetime import date
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import utils
from app import models, database
from app.schemas.contract import ContractCreate, ContractUpdate, ContractOut,PaginatedContract, FilterRequest, ContractDetailOut
import os
from docxtpl import DocxTemplate
from fastapi.responses import FileResponse
import pythoncom
from docx2pdf import convert
router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.get("/", response_model=PaginatedContract)
def get_contracts(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo tên khách hoặc số phòng"),
    sort_field: str = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp")
):
    query = db.query(models.Contract)
    if search:
        query = query.join(models.Tenant).join(models.Room).filter(
            (models.Tenant.tenant_id.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )
    valid_sort_fields = {
        "start_date": models.Contract.start_date,
        "end_date": models.Contract.end_date,
        "full_name": models.Tenant.full_name,
        "room_name": models.Room.room_number,
        "deposit_amount": models.Contract.deposit_amount,
        "monthly_rent": models.Contract.monthly_rent,
        "num_people": models.Contract.num_people,
        "num_vehicles": models.Contract.num_vehicles,
        "contract_status": models.Contract.contract_status,
        "created_at": models.Contract.created_at,
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


@router.get("/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, db: Session = Depends(database.get_db)):
    contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.post("/", response_model=ContractOut, status_code=201)
def create_contract(contract: ContractCreate, db: Session = Depends(database.get_db)):
    # Đảm bảo path_contract được truyền vào và lưu đúng
    db_contract = models.Contract(**contract.dict())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, contract: ContractUpdate, db: Session = Depends(database.get_db)):
    db_contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    for key, value in contract.dict(exclude_unset=True).items():
        setattr(db_contract, key, value)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.delete("/{contract_id}", response_model=dict)
def delete_contract(contract_id: int, db: Session = Depends(database.get_db)):
    db_contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(db_contract)
    db.commit()
    return {"message": "Contract deleted successfully"}

@router.delete("/{tenant_id}", response_model=dict)
def delete_tenant(tenant_id: str, db: Session = Depends(database.get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(db_tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}

@router.post("/filter", response_model=PaginatedContract)
def filter_tenants(
    request: FilterRequest,
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    query = db.query(models.Contract)

    # Map field hợp lệ
    valid_fields = {
        "full_name": (models.Tenant.full_name, str),
        "room_name": (models.Room.room_number, str),
        "start_date": (models.Contract.start_date, date),
        "end_date": (models.Contract.end_date, date),
        "deposit_amount": (models.Contract.deposit_amount, float),
        "monthly_rent": (models.Contract.monthly_rent, float),
        "num_people": (models.Contract.num_people, int),
        "num_vehicles": (models.Contract.num_vehicles, int),
        "contract_status": (models.Contract.contract_status, str),
        "created_at": (models.Contract.created_at, datetime),
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

@router.get("/by-tenant/{tenant_id}", response_model=ContractDetailOut)
def get_contract_by_tenant(tenant_id: str, db: Session = Depends(database.get_db)):
    contract = (
        db.query(models.Contract, models.Tenant.full_name, models.Room.room_number)
        .join(models.Tenant, models.Contract.tenant_id == models.Tenant.tenant_id)
        .join(models.Room, models.Contract.room_id == models.Room.room_id)
        .filter(models.Contract.tenant_id == tenant_id)
        .first()
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found for tenant")
    contract_obj, full_name, room_number = contract
    return {
        "contract_id": contract_obj.contract_id,
        "full_name": full_name,
        "room_number": room_number,
        "start_date": contract_obj.start_date,
        "end_date": contract_obj.end_date,
        "deposit_amount": contract_obj.deposit_amount,
        "monthly_rent": contract_obj.monthly_rent,
        "num_people": contract_obj.num_people,
        "num_vehicles": contract_obj.num_vehicles,
        "contract_status": contract_obj.contract_status,
        "path_contract": getattr(contract_obj, "path_contract", None)  # Luôn trả về trường này
    }

import os

# Đường dẫn gốc backend (dùng cho template)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEMPLATE_PATH = os.path.join(PROJECT_ROOT, "ContractFile", "Mau_Hop_Dong_Cho_Thue_Tro.docx")

# Đường dẫn FE public (nằm ngoài backend)
FE_PUBLIC_CONTRACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "nha-tro-fe", "public", "contracts_file")
)
os.makedirs(FE_PUBLIC_CONTRACTS_DIR, exist_ok=True)

@router.get("/export/{contract_id}")
def export_contract(
    contract_id: int,
    file_type: str = Query("docx", enum=["docx", "pdf"]),
    file_name: str = Query(None),
    db: Session = Depends(database.get_db)
):
    # Lấy hợp đồng
    contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng")

    # Lấy thông tin tenant
    tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == contract.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Không tìm thấy người thuê")
    month_rent_read = utils.num2words_vnd(int(contract.monthly_rent)) 
    deposit_amount_read = utils.num2words_vnd(int(contract.deposit_amount))
    # Chuẩn bị dữ liệu context để render vào mẫu
    start_date = datetime.date.today()
    context = {
        "day": start_date.day,
        "month": start_date.month,
        "year": start_date.year,
        "tenant_name": tenant.full_name,
        "tenant_id": tenant.tenant_id,
        "deposit_amount": f"{contract.deposit_amount:,.0f}" if contract.deposit_amount else "0",
        "monthly_rent": f"{contract.monthly_rent:,.0f}" if contract.monthly_rent else "0",
        "monthly_rent_read": month_rent_read,
        "deposit_amount_read": deposit_amount_read,
    }

    # Load file mẫu và render
    doc = DocxTemplate(TEMPLATE_PATH)
    doc.render(context)

    # Tên file theo yêu cầu FE
    safe_tenant_name = "".join(c if c.isalnum() else "_" for c in tenant.full_name)
    ext = "pdf" if file_type == "pdf" else "docx"
    filename = file_name if file_name else f"{safe_tenant_name}_contract.{ext}"
    file_path = os.path.join(FE_PUBLIC_CONTRACTS_DIR, filename)

    # Lưu file docx
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
        contract.path_contract = f"/contracts_file/{filename}"
        db.commit()
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    else:
        contract.path_contract = f"/contracts_file/{filename}"
        db.commit()
        return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=filename)