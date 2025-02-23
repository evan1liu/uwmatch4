from fastapi import APIRouter, HTTPException, status, Form
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from uuid import uuid4
import re
from ..models.user import UserSignup, UserInDB, UserOnboarding, Token
from ..auth import create_access_token, get_current_active_user
from ..config import Settings
from ..database import user_collection
from ..utils import send_verification_email
from fastapi import Depends

router = APIRouter()

@router.post("/request-verification")
async def request_verification(email: str = Form(...)):
    # Validate email domain
    if not re.match(r".*@wisc\.edu$", email, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Only wisc.edu email addresses are allowed.")

    user = await user_collection.find_one({"email": email})
    if not user:
        # Create new user if not exists
        user_data = {
            "email": email,
            "full_name": None,  # Will be set during onboarding
            "disabled": False,
            "verified": False,
            "signup_datetime": datetime.utcnow(),
        }
        await user_collection.insert_one(user_data)

    # Generate and store verification token
    token = str(uuid4())
    expiration = datetime.utcnow() + timedelta(minutes=10)
    await user_collection.update_one(
        {"email": email},
        {"$set": {"verification_token": token, "token_expiration": expiration}}
    )

    # Send verification email
    try:
        send_verification_email(email, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Verification email sent. Please check your email to log in."}

@router.get("/verify")
async def verify_email(token: str, email: str):
    user = await user_collection.find_one({"email": email})
    if not user or user.get("verification_token") != token:
        raise HTTPException(status_code=400, detail="Invalid verification link")

    if user.get("token_expiration") < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification link has expired")

    # Mark user as verified if not already
    if not user.get("verified"):
        await user_collection.update_one(
            {"email": email},
            {"$set": {"verified": True}}
        )

    # Clear the token
    await user_collection.update_one(
        {"email": email},
        {"$unset": {"verification_token": "", "token_expiration": ""}}
    )

    # Issue JWT token
    access_token_expires = timedelta(minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )

    # Redirect to frontend with token
    frontend_url = f"https://www.uwmatch.com/login?token={access_token}"
    return RedirectResponse(url=frontend_url)

@router.post("/onboarding")
async def onboarding_user(user_data: UserOnboarding, current_user: UserInDB = Depends(get_current_active_user)):
    result = await user_collection.update_one(
        {"email": current_user.email},
        {"$set": {"major": user_data.major, "year": user_data.year, "full_name": current_user.full_name}}
    )
    return {"message": "User updated successfully"}