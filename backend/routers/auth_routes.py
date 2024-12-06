from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta

from app.models import UserRegister, Token
from app.auth import authenticate_user, create_access_token
from app.config import settings
from app.database import user_collection
from app.utils import get_hashed_password
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register")
async def register_user(user_data: UserRegister):
    db_user = {
        "full_name": user_data.fullName,
        "email": user_data.email,
        "hashed_password": get_hashed_password(user_data.password),
        "disabled": False
    }

    existing_user = await user_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    await user_collection.insert_one(db_user)
    return {"message": "User created successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"} 