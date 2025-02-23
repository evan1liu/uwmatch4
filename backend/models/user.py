from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserOnboarding(BaseModel):
    full_name: str
    major: str
    year: str 

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(BaseModel):
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    verified: bool = False  # Tracks if email is verified
    verification_token: Optional[str] = None  # Temporary token for verification
    token_expiration: Optional[datetime] = None  # Token expiration time
    major: Optional[str] = None  # Added for onboarding
    year: Optional[str] = None   # Added for onboarding

    @classmethod
    def from_mongo(cls, mongo_user):
        if mongo_user:
            mongo_user['id'] = str(mongo_user['_id'])
            return cls(**mongo_user)
        return None