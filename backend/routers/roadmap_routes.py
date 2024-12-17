from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime
from ..models.roadmap import RoadmapChange
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

@router.post("/roadmap/change")
async def change_roadmap(
    change: RoadmapChange,
    current_user = Depends(get_current_active_user)
):
    try:
        print(f"\n=== Processing Roadmap Change ===")
        print(f"Course ID: {change.courseId}")
        print(f"To Term: {change.toTerm} {change.toYear}")
        print(f"From Term: {change.fromTerm} {change.fromYear if change.fromTerm else 'None'}")
        print(f"User ID: {current_user.id}")
        
        try:
            course_object_id = ObjectId(change.courseId)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid course ID format: {change.courseId}")

        # Check if course exists
        course = await course_collection.find_one({"_id": course_object_id})
        if not course:
            raise HTTPException(status_code=404, detail=f"Course not found with ID: {change.courseId}")

        # If fromTerm is provided, this is a move operation
        if change.fromTerm:
            # Remove from old term
            await roadmap_collection.delete_one({
                "userId": current_user.id,
                "courseId": course_object_id,
                "year": change.fromYear,
                "term": change.fromTerm
            })

        # Add to new term
        await roadmap_collection.update_one(
            {
                "userId": current_user.id,
                "courseId": course_object_id,
                "year": change.toYear,
                "term": change.toTerm
            },
            {
                "$set": {
                    "userId": current_user.id,
                    "courseId": course_object_id,
                    "year": change.toYear,
                    "term": change.toTerm,
                    "addedAt": datetime.utcnow()
                }
            },
            upsert=True
        )

        return {
            "message": "Roadmap updated successfully",
            "action": "moved" if change.fromTerm else "added",
            "course": {
                "id": str(course["_id"]),
                "title": course["title"],
                "credits": course.get("credits", 0),
                "year": change.toYear,
                "term": change.toTerm
            }
        }
    except HTTPException as e:
        print(f"HTTP Exception occurred: {e.detail}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))