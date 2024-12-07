from fastapi import APIRouter, Depends, HTTPException
from backend.models import User
from backend.auth import get_current_active_user
from ..database import user_collection
from bson import ObjectId

router = APIRouter()

@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    user = await user_collection.find_one(
    {"email": current_user.email}
)
    user_data = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "major": user["major"],
        "year": user["year"]
    }

    return user_data 