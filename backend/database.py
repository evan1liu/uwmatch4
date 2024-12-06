from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client.uwmatch  # Database name
user_collection = db.users
course_collection = db.courses
saved_course_collection = db.saved_courses
