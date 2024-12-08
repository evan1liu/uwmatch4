from fastapi import APIRouter, Depends
from backend.models import User
from backend.auth import get_current_active_user
from ..database import user_collection # importing "user_collection" from database.py to connect with mongodb colleciton that stores user data

router = APIRouter()

@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    # use mongodb function "find_one" to find the current user data with his/her email
    user = await user_collection.find_one(
    {"email": current_user.email}
)   
    # the user_data object contains the attributes that will be returning to the frontend
    user_data = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "major": user["major"],
        "year": user["year"]
    }

    return user_data 