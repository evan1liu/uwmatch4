from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserSignup(BaseModel):
    fullName: str
    email: str
    password: str

class UserOnboarding(BaseModel):
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
    hashed_password: str

    @classmethod
    def from_mongo(cls, mongo_user):
        if mongo_user:
            mongo_user['id'] = str(mongo_user['_id'])
            return cls(**mongo_user)
        return None 