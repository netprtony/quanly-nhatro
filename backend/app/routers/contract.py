from datetime import date
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.contract import ContractCreate, ContractUpdate, ContractOut,PaginatedContract, FilterRequest


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
        "contract_status": models.Contract.contract_status,
        "created_at": models.Contract.created_at,
    }
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