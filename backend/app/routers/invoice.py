from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, database
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceOut, PaginatedInvoiceOut

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("/", response_model=PaginatedInvoiceOut)
def get_invoices(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = Query(None, description="Tìm theo phòng hoặc tháng")
):
    query = db.query(models.Invoice)
    if search:
        query = query.join(models.Room).filter(
            (models.Room.room_number.ilike(f"%{search}%")) |
            (models.Invoice.month.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total}

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