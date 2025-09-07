from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from app.models import Room, Contract, Invoice, Payment, Tenant

from app.database import get_db
from fastapi import Query
router = APIRouter(prefix="/report", tags=["Report"])

@router.get("/summary")
def get_report_summary(db: Session = Depends(get_db)):
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
# =============================
# ROOMS
# =============================
@router.get("/rooms/availability", response_model=List[Dict[str, Any]])
def room_availability(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_RoomAvailabilityStats()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/rooms/avg-revenue", response_model=List[Dict[str, Any]])
def avg_revenue_roomtype(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_AvgRevenueByRoomType()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/rooms/status-floor", response_model=List[Dict[str, Any]])
def room_status_floor(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_RoomStatusByFloor()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/rooms/top-types", response_model=List[Dict[str, Any]])
def top_room_types(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_TopRoomTypes()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/rooms/maintenance", response_model=List[Dict[str, Any]])
def rooms_need_maintenance(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_RoomsNeedMaintenance()")).mappings().all()
    return [dict(row) for row in result]


# =============================
# TENANTS / USERS
# =============================

@router.get("/tenants/status", response_model=List[Dict[str, Any]])
def tenant_status(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_TenantCountByStatus()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/tenants/gender-age", response_model=List[Dict[str, Any]])
def tenant_gender_age(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_TenantGenderAgeStats()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/tenants/new", response_model=List[Dict[str, Any]])
def tenant_new(period_type: str = Query("MONTH", enum=["MONTH", "QUARTER", "YEAR"]), db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_NewTenantsByPeriod(:p_type)"),
        {"p_type": period_type}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/tenants/expiring-contracts", response_model=List[Dict[str, Any]])
def tenants_expiring_contracts(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_TenantsExpiringContracts()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/tenants/debt", response_model=List[Dict[str, Any]])
def tenants_with_debt(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_TenantsWithDebt()")).mappings().all()
    return [dict(row) for row in result]


# =============================
# ELECTRICITY / WATER METERS
# =============================

@router.get("/utility/usage-electricity", response_model=List[Dict[str, Any]])
def electricity_usage(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_ElectricityUsageByMonthYear(:m, :y)"),
        {"m": month, "y": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/utility/usage-water", response_model=List[Dict[str, Any]])
def water_usage(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_WaterUsageByMonthYear(:m, :y)"),
        {"m": month, "y": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/utility/avg-utility-cost-room", response_model=List[Dict[str, Any]])
def avg_utility_cost_by_room(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_AvgUtilityCostByRoom()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/utility/compare-month", response_model=List[Dict[str, Any]])
def compare_utility_month(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_CompareUtilityMonth(:m, :y)"),
        {"m": month, "y": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/utility/outlier-rooms", response_model=List[Dict[str, Any]])
def utility_outlier_rooms(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_UtilityOutlierRooms(:m, :y)"),
        {"m": month, "y": year}
    ).mappings().all()
    return [dict(row) for row in result]
# =============================
# INVOICES / PAYMENTS
# =============================

@router.get("/invoices/revenue-by-period", response_model=List[Dict[str, Any]])
def revenue_by_period(
    period_type: str = Query(..., enum=["MONTH", "QUARTER", "YEAR"]),
    month: int = None,
    quarter: int = None,
    year: int = None,
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("CALL sp_TotalRevenueByPeriod(:p_type, :p_month, :p_quarter, :p_year)"),
        {"p_type": period_type, "p_month": month, "p_quarter": quarter, "p_year": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/invoices/paid-ratio", response_model=List[Dict[str, Any]])
def invoice_paid_ratio(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_InvoicePaidRatio()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/invoices/revenue-by-fee-type", response_model=List[Dict[str, Any]])
def revenue_by_fee_type(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_RevenueByFeeType(:p_month, :p_year)"),
        {"p_month": month, "p_year": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/invoices/overdue", response_model=List[Dict[str, Any]])
def overdue_invoices(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_OverdueInvoices()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/payments/total-by-method", response_model=List[Dict[str, Any]])
def total_paid_by_method(month: int, year: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("CALL sp_TotalPaidByMethod(:p_month, :p_year)"),
        {"p_month": month, "p_year": year}
    ).mappings().all()
    return [dict(row) for row in result]


# =============================
# RESERVATIONS
# =============================

@router.get("/reservations/pending", response_model=List[Dict[str, Any]])
def pending_reservations(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_PendingReservations()")).mappings().all()
    return [dict(row) for row in result]


# =============================
# NOTIFICATIONS
# =============================

@router.get("/notifications/count-by-period", response_model=List[Dict[str, Any]])
def notification_count_by_period(
    period_type: str = Query(..., enum=["MONTH", "QUARTER", "YEAR"]),
    month: int = None,
    quarter: int = None,
    year: int = None,
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("CALL sp_NotificationCountByPeriod(:p_type, :p_month, :p_quarter, :p_year)"),
        {"p_type": period_type, "p_month": month, "p_quarter": quarter, "p_year": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/notifications/read-ratio", response_model=List[Dict[str, Any]])
def notification_read_ratio(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_NotificationReadRatio()")).mappings().all()
    return [dict(row) for row in result]

# =============================
# DEVICES
# =============================

@router.get("/devices/broken", response_model=List[Dict[str, Any]])
def broken_devices(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_BrokenDevices()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/devices/list-status", response_model=List[Dict[str, Any]])
def device_list_with_status(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_DeviceListWithStatus()")).mappings().all()
    return [dict(row) for row in result]
# =============================
# CONTRACTS
# =============================
@router.get("/contracts/new", response_model=List[Dict[str, Any]])
def new_contracts_by_period(
    period_type: str = Query(..., enum=["MONTH", "QUARTER", "YEAR"]),
    month: int = None,
    quarter: int = None,
    year: int = None,
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("CALL sp_NewContractsByPeriod(:p_type, :p_month, :p_quarter, :p_year)"),
        {"p_type": period_type, "p_month": month, "p_quarter": quarter, "p_year": year}
    ).mappings().all()
    return [dict(row) for row in result]

@router.get("/contracts/status-ratio", response_model=List[Dict[str, Any]])
def contract_status_ratio(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_ContractStatusRatio()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/contracts/avg-duration", response_model=List[Dict[str, Any]])
def avg_contract_duration(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_AvgContractDuration()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/contracts/expired", response_model=List[Dict[str, Any]])
def expired_contracts(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_ExpiredContracts()")).mappings().all()
    return [dict(row) for row in result]

@router.get("/contracts/expiring-soon", response_model=List[Dict[str, Any]])
def expiring_soon_contracts(db: Session = Depends(get_db)):
    result = db.execute(text("CALL sp_ExpiringSoonContracts()")).mappings().all()
    return [dict(row) for row in result]