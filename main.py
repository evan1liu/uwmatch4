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
saved_course_collection = db.saved_courses  # Add this line for saved courses collection

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

class UserInDB(BaseModel):
    id: str | None = None
    email: str
    full_name: str | None = None
    disabled: bool | None = None
    hashed_password: str

    @classmethod
    def from_mongo(cls, mongo_user):
        if mongo_user:
            # Convert MongoDB _id to string id
            mongo_user['id'] = str(mongo_user['_id'])
            return cls(**mongo_user)
        return None

class Course(BaseModel):
    title: str
    credits: int
    course_designation: str | None = None
    description: str | None = None
    last_taught: str | None = None
    learning_outcomes: str | None = None
    repeatable: bool | None = None
    requisites: str | None = None

class SavedCourse(BaseModel):
    user_id: str
    course_id: str
    saved_at: datetime | None = None

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_hashed_password(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    user_dict = await db.users.find_one({"email": email})
    if user_dict:
        # Convert MongoDB _id to string id
        user_dict['id'] = str(user_dict['_id'])
        return UserInDB(**user_dict)
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
@api_router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    user_data = {
        "full_name": current_user.full_name,
        "email": current_user.email,
    }
    return user_data

@api_router.get("/courses")
async def get_courses():
    # when the mongodb function find() is empty, it returns all the documents within this collection, so we're returning all the courses to the frontend
    courses = await course_collection.find().to_list(length=None)
    
    # return only these three attributes for more simplified course information in the courses page
    return [{
        "id": str(course["_id"]),
        "title": course.get("title"),
        "credits": course.get("credits")
    } for course in courses]

# this route is what the frontend calls when the user clicks on each course card for reading more details
@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if course:
        course["id"] = str(course["_id"]) # we need to convert the MongoDB ObjectID to an actualy JSON readable string
        del course["_id"] # delete the MongoDB ObjectID before returning
        return course
    raise HTTPException(status_code=404, detail="Course not found")

# this backend route handles the logic of saving and unsaving a course
# we're using the same route because idk, it's just easier and simpler
@api_router.post("/save-course/{course_id}")
async def save_course(course_id: str, current_user: UserInDB = Depends(get_current_active_user)):
    # Check if course is already saved (return None if it's not saved and return a complete document if it's saved)
    existing_save = await saved_course_collection.find_one({
        "user_id": current_user.id,
        "course_id": course_id
    })
    
    if existing_save:
        # If already saved, delete it, since the user is most likely unsaving the course
        await saved_course_collection.delete_one({
            "user_id": current_user.id,
            "course_id": course_id
        })
        return { # return a message to the frontend
            "message": "Course unsaved successfully"
        }

    # add a new entry to the collection saved_courses with the user's id, the course_id, and the date time
    saved_course = {
        "user_id": current_user.id,
        "course_id": course_id,
        "saved_at": datetime.utcnow()
    }
    
    # if the course is not saved, then we use the mongodb function insert_one to add this new entry
    result = await saved_course_collection.insert_one(saved_course)
    return { # return a message to the frontend along with the course_id
        "message": "Course saved successfully",
        "saved_course_id": str(result.inserted_id)
    }

@api_router.get("/saved-courses")
async def get_saved_courses(current_user: UserInDB = Depends(get_current_active_user)): # with this Depends(), the user must have a valid JWT token since accessing this route is depended on get_current_active_user which is depended on get_current_user
    saved_courses = await saved_course_collection.find({
        "user_id": current_user.id
    }).to_list(length=None) # use the user's id to retrieve all the courses saved by that user, and then convert them into a list of objects (that contains user_id and course_id)
    
    # in the original entry in the saved_courses collection, we saved the course_id as a string, but we need to convert it to MongoDB ObjectId to perform searching
    course_ids = [ObjectId(sc["course_id"]) for sc in saved_courses]
    
    # essentially, with the $in search function, we can search with our list course_ids to retrieve a list of course objects that match the list of course_ids
    courses = await course_collection.find({"_id": {"$in": course_ids}}).to_list(length=None)
    
    # we return each saved course to the frontend one by one
    return [{ # only returning the course_id, the title, and the credits (just like the route /courses)
        "id": str(course["_id"]),
        "title": course.get("title", "No title"),
        "credits": course.get("credits", 0)
    } for course in courses]

# the router is /api
app.include_router(api_router)

# If there's no environment vairable named ENV, default it to 'development'
ENV = os.getenv('ENV', 'development')

# This only runs during production
# We need to set an environment variable on Heroku called ENV=production
# I have no idea what it does, but you include this during deployment
if ENV == 'production':
    # Serve static files first
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Handle API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        # For all other routes, serve the index.html
        return FileResponse("frontend/dist/index.html")
    
    # Mount the root last
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")