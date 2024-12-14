from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from typing import List

from ..database import saved_course_collection, course_collection
from ..models.search import SearchInput
from ..models.user import UserInDB
from ..auth import get_current_active_user

router = APIRouter()

@router.post("/save-course/{course_id}")
async def save_course(course_id: str, current_user: UserInDB = Depends(get_current_active_user)):
    existing_save = await saved_course_collection.find_one({
        "user_id": current_user.id,
        "course_id": course_id
    })

    if existing_save:
        await saved_course_collection.delete_one({
            "user_id": current_user.id,
            "course_id": course_id
        })
        return {
            "message": "Course unsaved successfully"
        }

    saved_course = {
        "user_id": current_user.id,
        "course_id": course_id,
        "saved_at": datetime.utcnow()
    }

    result = await saved_course_collection.insert_one(saved_course)
    return {
        "message": "Course saved successfully",
        "saved_course_id": str(result.inserted_id)
    }

@router.get("/saved-courses")
async def get_saved_courses(current_user: UserInDB = Depends(get_current_active_user)):
    saved_courses = await saved_course_collection.find({
        "user_id": current_user.id
    }).to_list(length=None)

    course_ids = [ObjectId(sc["course_id"]) for sc in saved_courses]
    courses = await course_collection.find({"_id": {"$in": course_ids}}).to_list(length=None)

    return [{
        "id": str(course["_id"]),
        "title": course.get("title", "No title"),
        "credits": course.get("credits", 0),
        "embedding": course.get("title_embedding"),
    } for course in courses] 

import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@router.post("/get-embedding")
async def get_embedding(search_input: SearchInput):
    try:
        response = client.embeddings.create(
            input=search_input.text,
            model="text-embedding-3-small"
        )
        return {"embedding": response.data[0].embedding}  # Return as JSON object
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))