from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.invoice_detail import InvoiceDetailCreate, InvoiceDetailUpdate, InvoiceDetailOut, PaginatedInvoiceDetail

router = APIRouter(prefix="/invoice-details", tags=["InvoiceDetails"])

@router.get("/", response_model=PaginatedInvoiceDetail)
def get_invoice_details(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    filter_invoice_id: int = Query(None)
):
    query = db.query(models.InvoiceDetail)
    if filter_invoice_id is not None:
        query = query.filter(models.InvoiceDetail.invoice_id == filter_invoice_id)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

@router.get("/{detail_id}", response_model=InvoiceDetailOut)
def get_invoice_detail(detail_id: int, db: Session = Depends(database.get_db)):
    detail = db.query(models.InvoiceDetail).filter(models.InvoiceDetail.detail_id == detail_id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Invoice detail not found")
    return detail

@router.post("/", response_model=InvoiceDetailOut, status_code=201)
def create_invoice_detail(detail: InvoiceDetailCreate, db: Session = Depends(database.get_db)):
    db_detail = models.InvoiceDetail(**detail.dict())
    db.add(db_detail)
    db.commit()
    db.refresh(db_detail)
    return db_detail

@router.put("/{detail_id}", response_model=InvoiceDetailOut)
def update_invoice_detail(detail_id: int, detail: InvoiceDetailUpdate, db: Session = Depends(database.get_db)):
    db_detail = db.query(models.InvoiceDetail).filter(models.InvoiceDetail.detail_id == detail_id).first()
    if not db_detail:
        raise HTTPException(status_code=404, detail="Invoice detail not found")
    for key, value in detail.dict(exclude_unset=True).items():
        setattr(db_detail, key, value)
    db.commit()
    db.refresh(db_detail)
    return db_detail

@router.delete("/{detail_id}", response_model=dict)
def delete_invoice_detail(detail_id: int, db: Session = Depends(database.get_db)):
    db_detail = db.query(models.InvoiceDetail).filter(models.InvoiceDetail.detail_id == detail_id).first()
    if not db_detail:
        raise HTTPException(status_code=404, detail="Invoice detail not found")
    db.delete(db_detail)
    db.commit()
    return {"detail": "Invoice detail deleted successfully"}

@router.get("/by-invoice/{invoice_id}", response_model=List[InvoiceDetailOut])
def get_invoice_details_by_invoice_id(invoice_id: int, db: Session = Depends(database.get_db)):
    details = db.query(models.InvoiceDetail).filter(models.InvoiceDetail.invoice_id == invoice_id).all()
    return details