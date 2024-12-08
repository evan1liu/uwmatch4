from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# define the pydantic model for user signup
# this is the data that will be sent from the frontend to /api/signup endpoint
class UserSignup(BaseModel):
    fullName: str
    email: str
    password: str

class SearchInput(BaseModel):
    text: str

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

class Course(BaseModel):
    title: str
    credits: int
    course_designation: Optional[str] = None
    description: Optional[str] = None
    last_taught: Optional[str] = None
    learning_outcomes: Optional[str] = None
    repeatable: Optional[bool] = None
    requisites: Optional[str] = None

class SavedCourse(BaseModel):
    user_id: str
    course_id: str
    saved_at: Optional[datetime] = None 