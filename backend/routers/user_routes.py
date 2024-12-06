from fastapi import APIRouter, Depends, HTTPException
from backend.models import User
from backend.auth import get_current_active_user

router = APIRouter()

@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    user_data = {
        "full_name": current_user.full_name,
        "email": current_user.email,
    }
    return user_data 