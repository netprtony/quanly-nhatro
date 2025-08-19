from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import models, database
from app.schemas.contract import ContractCreate, ContractUpdate, ContractOut


router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.get("/", response_model=List[ContractOut])
def get_contracts(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Tìm theo tên khách hoặc số phòng")
):
    query = db.query(models.Contract)
    if search:
        query = query.join(models.Tenant).join(models.Room).filter(
            (models.Tenant.full_name.ilike(f"%{search}%")) |
            (models.Room.room_number.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

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
