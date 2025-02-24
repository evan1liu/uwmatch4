from fastapi import APIRouter, HTTPException, status, Form
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from uuid import uuid4
import re
from ..models.user import UserInDB, UserOnboarding
from ..auth import create_access_token, get_current_active_user
from ..config import Settings
from ..database import user_collection
from ..utils import send_verification_email
from fastapi import Depends

router = APIRouter()

@router.post("/request-verification")
async def request_verification(
    email: str = Form(...),
):
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

    # here, we determine whether or not we're in development mode or production mode
    # based on the mode, we have different backend domains, therefore different verification urls
    if Settings.ENV == "development":
        backend_domain = "http://127.0.0.1:8000"
    else:
        backend_domain = "https://www.uwmatch.com" # must include the front "https://" for secure connection

    # Build the verification link using the front-end domain
    verification_url = f"{backend_domain}/api/verify?token={token}&email={email}"

    # Send verification email
    try:
        send_verification_email(email, verification_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Verification email sent. Please check your email."}

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

    # here, we determine whether or not we're in development mode or production mode
    # based on the mode, we have different backend domains, therefore different redirect urls

    if Settings.ENV == "development":
        frontend_domain = "http://localhost:5173"
    else:
        frontend_domain = "https://www.uwmatch.com" # must include the front "https://" for secure connection

    # Clear the token
    await user_collection.update_one(
        {"email": email},
        {"$unset": {"verification_token": "", "token_expiration": ""}}
    )

    # Issue JWT token
    access_token = create_access_token(data={"sub": email})

    # Redirect to frontend with the "LOGGED IN TOKEN" 
    redirect_url = f"{frontend_domain}/login?token={access_token}"
    print("ENV:", Settings.ENV)
    print("Redirecting to:", redirect_url)
    return RedirectResponse(url=redirect_url)

# when the user first signs in
# if he doesn't have any major, year, or full name data, then he's asked to fill out the onboarding form
@router.post("/onboarding")
async def onboarding_user(user_data: UserOnboarding, current_user: UserInDB = Depends(get_current_active_user)):
    result = await user_collection.update_one(
        {"email": current_user.email},
        {"$set": {"major": user_data.major, "year": user_data.year, "full_name": current_user.full_name}}
    )
    return {"message": "User updated successfully"}