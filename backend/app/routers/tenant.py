from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas import TenantCreate, TenantUpdate, TenantOut
from app import models, utils, database
from app.schemas import tenant as tenant_schemas
router = APIRouter(prefix="/tenants", tags=["Tenants"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lấy danh sách tenant (có phân trang, tìm kiếm)
@router.get("/", response_model=List[tenant_schemas.TenantOut])
def get_tenants(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Tìm kiếm theo tên hoặc số điện thoại")
):
    query = db.query(models.Tenant)
    if search:
        query = query.filter(
            (models.Tenant.full_name.ilike(f"%{search}%")) |
            (models.Tenant.phone_number.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

# Lấy chi tiết tenant
@router.get("/{tenant_id}", response_model=tenant_schemas.TenantOut)
def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

# Tạo mới tenant
@router.post("/", response_model=tenant_schemas.TenantOut, status_code=201)
def create_tenant(tenant: tenant_schemas.TenantCreate, db: Session = Depends(get_db)):
    if db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant.tenant_id).first():
        raise HTTPException(status_code=400, detail="Tenant ID already exists")
    db_tenant = models.Tenant(**tenant.dict())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# Cập nhật tenant
@router.put("/{tenant_id}", response_model=tenant_schemas.TenantOut)
def update_tenant(tenant_id: str, tenant: tenant_schemas.TenantUpdate, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for key, value in tenant.dict(exclude_unset=True).items():
        setattr(db_tenant, key, value)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# Xóa tenant
@router.delete("/{tenant_id}", response_model=dict)
def delete_tenant(tenant_id: str, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.tenant_id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(db_tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}