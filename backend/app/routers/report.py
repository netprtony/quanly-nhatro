from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, database
from app.models import Room, Contract, Invoice, Payment, Tenant

router = APIRouter(prefix="/report", tags=["Report"])

@router.get("/summary")
def get_report_summary(db: Session = Depends(database.get_db)):
    total_rooms = db.query(Room).count()
    rented_rooms = db.query(Contract).filter(Contract.contract_status == "Active").count()
    total_contracts = db.query(Contract).count()
    total_tenants = db.query(Tenant).count()
    total_invoices = db.query(Invoice).count()
    paid_invoices = db.query(Invoice).filter(Invoice.is_paid == True).count()
    unpaid_invoices = db.query(Invoice).filter(Invoice.is_paid == False).count()
    total_payments = db.query(Payment).count()
    total_revenue = db.query(Payment).with_entities(
        Payment.paid_amount
    ).all()
    total_revenue = sum([p.paid_amount for p in total_revenue])

    return {
        "total_rooms": total_rooms,
        "rented_rooms": rented_rooms,
        "total_contracts": total_contracts,
        "total_tenants": total_tenants,
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "unpaid_invoices": unpaid_invoices,
        "total_payments": total_payments,
        "total_revenue": total_revenue
    }