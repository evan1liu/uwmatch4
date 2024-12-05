from fastapi import Depends, FastAPI, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

# don't delete these imports, these are used for deployment
from fastapi.staticfiles import StaticFiles 
from fastapi.responses import FileResponse

load_dotenv()

# Secret key and algorithm settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.uwmatch  # Database name
user_collection = db.users  # Collection name
course_collection = db.courses  # Add this line for courses collection

# Pydantic models
class UserRegister(BaseModel):
    fullName: str
    email: str
    password: str
    confirmPassword: str | None = None  # Optional if you don't need it

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str or None = None

class User(BaseModel):
    email: str
    full_name: str or None = None
    disabled: bool or None = None

class UserInDB(User):
    hashed_password: str

class Course(BaseModel):
    title: str
    credits: int
    course_designation: str | None = None
    description: str | None = None
    last_taught: str | None = None
    learning_outcomes: str | None = None
    repeatable: bool | None = None
    requisites: str | None = None

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_hashed_password(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    user = await user_collection.find_one({"email": email})
    if user:
        return UserInDB(**user)
    return None

async def create_user(user_data: dict):
    existing_user = await user_collection.find_one({"email": user_data["email"]})
    if existing_user:
        return None
    result = await user_collection.insert_one(user_data)
    return user_data

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta or None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Create API router
api_router = APIRouter(prefix="/api")

# Move all API routes to use api_router instead of app
@api_router.post("/register")  # Note: removed /api prefix
async def register_user(user_data: UserRegister):
    db_user = {
        "full_name": user_data.fullName,
        "email": user_data.email,
        "hashed_password": get_hashed_password(user_data.password),
        "disabled": False
    }

    user = await create_user(db_user)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return {"message": "User created successfully"}

@api_router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    # although we're actually using email, OAuth2PasswordRequestForm from FastAPI only accepts the username and password attributes
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# the homepage for displaying user's information
@api_router.get("/v1/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    user_data = {
        "full_name": current_user.full_name,
        "email": current_user.email,
    }
    return user_data

@api_router.get("/v1/courses")
async def get_courses():
    try:
        # Use course_collection instead of db.courses
        courses = await course_collection.find().to_list(length=None)
        # Debug: Print the first course to see its structure
        if courses:
            print("First course document:", courses[0])
        else:
            print("No courses found in database")
            
        return [{
            "id": str(course["_id"]),
            # Use .get() method to safely access dictionary keys
            "title": course.get("title", "No title"),  # Provides a default value if key doesn't exist
            "credits": course.get("credits", 0)  # Provides a default value if key doesn't exist
        } for course in courses]
    except Exception as e:
        print(f"Error in get_courses: {str(e)}")
        print(f"Full error details: {repr(e)}")  # Add more detailed error information
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@api_router.get("/v1/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if course:
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    raise HTTPException(status_code=404, detail="Course not found")

# Include the router
app.include_router(api_router)

# FOR PRODUCTION
# Mount static files after including the router
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")

# # Optional: Fallback route for SPA (if needed)
# @app.get("/{full_path:path}")
# async def serve_spa(full_path: str):
#     return FileResponse("frontend/dist/index.html")