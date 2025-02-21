from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from bson import ObjectId
from datetime import datetime
from ..models.user import UserSignup, UserInDB, UserOnboarding, Token
from ..auth import (
    authenticate_user, 
    create_access_token,
    get_current_active_user
)
from ..config import Settings
from ..database import user_collection
from ..utils import get_hashed_password
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/signup")
async def singup_user(user_data: UserSignup):
    db_user = {
        "full_name": user_data.fullName,
        "email": user_data.email,
        "hashed_password": get_hashed_password(user_data.password),
        "singed_up_datetime": datetime.utcnow(),
        "disabled": False
    }

    existing_user = await user_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already signed up"
        )
    
    await user_collection.insert_one(db_user)
    return {"message": "User created successfully"}

# the backend root for dealing with the response to the follow up questions for a user during register
@router.post("/onboarding")
async def onboarding_user(user_data: UserOnboarding, current_user: UserInDB = Depends(get_current_active_user)):
    
    result = await user_collection.update_one(
        {"_id": ObjectId(current_user.id)},  # Change to use ObjectId
        {
            "$set": {
                "major": user_data.major,
                "year": user_data.year
            }
        }
    )
    return {"message": "User updated successfully"}

# this response_model=Token is a Pydantic model that defines the datatype of this token, which inclues the actual token string and the token type 
@router.post("/token", response_model=Token)
# OAuth2PasswordRequestForm is a data validation schema
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"} 