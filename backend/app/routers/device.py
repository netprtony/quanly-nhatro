from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, utils, database
router = APIRouter(prefix="/devices", tags=["Devices"])
