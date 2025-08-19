from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List


router = APIRouter(prefix="/contracts", tags=["Contracts"])
