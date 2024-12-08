from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from backend.database import course_collection
from backend.models import Course, SearchInput, UserInDB
from backend.auth import get_current_active_user

router = APIRouter()

@router.get("/courses")
async def get_courses():
    courses = await course_collection.find().to_list(length=None)
    return [{
        "id": str(course["_id"]),
        "title": course.get("title"),
        "credits": course.get("credits"),
        "embedding": course.get("title_embedding"),
    } for course in courses]

@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await course_collection.find_one({"_id": ObjectId(course_id)})
    if course:
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    raise HTTPException(status_code=404, detail="Course not found")


import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@router.post("/search-courses")
async def search_courses(search_input: SearchInput, current_user: UserInDB = Depends(get_current_active_user)):
    try:
        # Get embedding for search term
        response = client.embeddings.create(
            input=search_input.text,
            model="text-embedding-3-small"
        )
        search_embedding = response.data[0].embedding

        # Get courses and calculate similarity in the backend
        courses = await course_collection.find().to_list(length=None)
        
        # Calculate similarities
        courses_with_scores = []
        for course in courses:
            if course.get('title_embedding'):
                similarity = sum(a * b for a, b in zip(search_embedding, course['title_embedding']))
                courses_with_scores.append({
                    'id': str(course['_id']),
                    'title': course['title'],
                    'credits': course['credits'],
                    'similarity': similarity
                })
        
        # Sort by similarity
        courses_with_scores.sort(key=lambda x: x['similarity'], reverse=True)
        
        return courses_with_scores

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))