from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database

router = APIRouter(prefix="/devices", tags=["Devices"])
