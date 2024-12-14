from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import Settings

client = AsyncIOMotorClient(Settings.MONGODB_URL)
db = client.uwmatch  # Database name
user_collection = db.users
course_collection = db.courses
saved_course_collection = db.saved_courses
roadmap_collection = db.roadmap
