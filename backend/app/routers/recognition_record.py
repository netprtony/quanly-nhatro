from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, cast, String
from typing import List, Optional
from app.models import RecognitionRecord
from app.schemas.recognition_record import RecognitionRecordCreate, RecognitionRecordOut
from app.database import get_db

router = APIRouter(prefix="/recognition-records", tags=["Recognition Records"])

@router.post("/", response_model=RecognitionRecordOut)
def create_record(record: RecognitionRecordCreate, db: Session = Depends(get_db)):
    db_record = RecognitionRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[RecognitionRecordOut])
def get_records(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: Optional[str] = Query(None, description="Tìm theo tenant_id, status, method"),
    sort_field: Optional[str] = Query(None, description="Trường sắp xếp"),
    sort_order: str = Query("asc", description="Thứ tự sắp xếp: asc/desc"),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái Check-in/Check-out"),
    method: Optional[str] = Query(None, description="Lọc theo phương thức nhận diện"),
    tenant_id: Optional[str] = Query(None, description="Lọc theo tenant_id"),
):
    query = db.query(RecognitionRecord)

    # Lọc theo search
    if search:
        query = query.filter(
            (RecognitionRecord.tenant_id.ilike(f"%{search}%")) |
            (RecognitionRecord.status.ilike(f"%{search}%")) |
            (RecognitionRecord.method.ilike(f"%{search}%"))
        )

    # Lọc theo các trường cụ thể
    if status:
        query = query.filter(RecognitionRecord.status == status)
    if method:
        query = query.filter(RecognitionRecord.method == method)
    if tenant_id:
        query = query.filter(RecognitionRecord.tenant_id == tenant_id)

    # Sắp xếp
    if sort_field:
        sort_column = getattr(RecognitionRecord, sort_field, None)
        if sort_column is not None:
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return items

@router.get("/{record_id}", response_model=RecognitionRecordOut)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(RecognitionRecord).filter(RecognitionRecord.record_id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.delete("/{record_id}", response_model=dict)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(RecognitionRecord).filter(RecognitionRecord.record_id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted"}