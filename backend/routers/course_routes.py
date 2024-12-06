from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import course_collection
from app.models import Course

router = APIRouter()

@router.get("/courses")
async def get_courses():
    courses = await course_collection.find().to_list(length=None)
    return [{
        "id": str(course["_id"]),
        "title": course.get("title"),
        "credits": course.get("credits")
    } for course in courses]

@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await course_collection.find_one({"_id": ObjectId(course_id)})
    if course:
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    raise HTTPException(status_code=404, detail="Course not found") 