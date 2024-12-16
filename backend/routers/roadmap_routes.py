from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime
from ..models.roadmap import RoadmapEntry
from ..auth import get_current_active_user
from ..database import course_collection, roadmap_collection

router = APIRouter()

@router.get("/roadmap", response_model=List[dict])
async def get_roadmap(current_user = Depends(get_current_active_user)):
    try:
        # Find all roadmap entries for the user
        roadmap_entries = await roadmap_collection.find(
            {"userId": current_user.id}
        ).to_list(length=None)

        # Get all course IDs from roadmap entries
        course_ids = [ObjectId(entry["courseId"]) for entry in roadmap_entries]
        
        # Get course details for all courses in roadmap
        courses = await course_collection.find(
            {"_id": {"$in": course_ids}}
        ).to_list(length=None)
        
        # Create a lookup dictionary for courses
        course_lookup = {str(course["_id"]): course for course in courses}

        # Transform the data to include course details
        transformed_roadmap = [{
            "id": str(entry["courseId"]),
            "title": course_lookup[str(entry["courseId"])]["title"],
            "credits": course_lookup[str(entry["courseId"])]["credits"],
            "year": entry["year"],
            "term": entry["term"],
            "addedAt": entry["addedAt"]
        } for entry in roadmap_entries]

        return transformed_roadmap
    except Exception as e:
        print(f"Error in get_roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmap/add")
async def add_or_remove_course(
    entry: RoadmapEntry,
    current_user = Depends(get_current_active_user)
):
    try:
        print(f"\n=== Adding/Removing Course from Roadmap ===")
        print(f"Course ID: {entry.courseId}")
        print(f"Term: {entry.term} {entry.year}")
        print(f"User ID: {current_user.id}")
        
        try:
            course_object_id = ObjectId(entry.courseId)
            print(f"Converted to ObjectId: {course_object_id}")
        except Exception as e:
            print(f"Error converting courseId to ObjectId: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid course ID format: {entry.courseId}")

        # Check if course exists
        course = await course_collection.find_one({"_id": course_object_id})
        if not course:
            print(f"Course not found in database")
            raise HTTPException(status_code=404, detail=f"Course not found with ID: {entry.courseId}")

        # Check if course is already in the roadmap for this term and year
        existing_entry = await roadmap_collection.find_one({
            "userId": current_user.id,
            "courseId": course_object_id,
            "year": entry.year,
            "term": entry.term
        })

        if existing_entry:
            # Remove the course from this term
            await roadmap_collection.delete_one({
                "userId": current_user.id,
                "courseId": course_object_id,
                "year": entry.year,
                "term": entry.term
            })
            return {
                "message": "Course removed from roadmap",
                "action": "removed"
            }

        # Add the course to the roadmap
        new_entry = await roadmap_collection.insert_one({
            "userId": current_user.id,
            "courseId": course_object_id,
            "year": entry.year,
            "term": entry.term,
            "addedAt": datetime.utcnow()
        })

        return {
            "message": "Course added to roadmap",
            "action": "added",
            "course": {
                "id": str(course["_id"]),
                "title": course["title"],
                "credits": course.get("credits", 0),
                "description": course.get("description"),
                "year": entry.year,
                "term": entry.term
            }
        }
    except HTTPException as e:
        print(f"HTTP Exception occurred: {e.detail}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/roadmap/move")
async def move_course(
    courseId: str,
    toYear: int,
    toTerm: str,
    current_user = Depends(get_current_active_user)
):
    try:
        course_object_id = ObjectId(courseId)
        result = await roadmap_collection.update_one(
            {
                "userId": current_user.id,
                "courseId": course_object_id
            },
            {"$set": {"year": toYear, "term": toTerm}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Course not found in roadmap")

        return {"message": "Course moved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))