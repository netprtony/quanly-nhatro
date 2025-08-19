# protected_route.py
from fastapi import APIRouter, Depends
from auth_dependency import get_current_user

router = APIRouter()

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {"message": f"Xin chào {current_user['sub']}"}