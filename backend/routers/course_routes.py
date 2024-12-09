from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
import os
from openai import OpenAI
from backend.database import course_collection
from backend.models import Course, SearchInput, UserInDB
from backend.auth import get_current_active_user
from ..vector_search import vector_search

router = APIRouter()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@router.get("/courses")
async def get_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(18, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user)
):
    skip = (page - 1) * limit
    
    # Get total count for pagination
    total_courses = await course_collection.count_documents({})
    
    # Fetch courses with pagination
    cursor = course_collection.find({}).skip(skip).limit(limit)
    courses = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for each course
    for course in courses:
        course["id"] = str(course["_id"])
        del course["_id"]
    
    # Check if there are more courses
    has_more = (skip + limit) < total_courses
    
    return {
        "courses": courses,
        "has_more": has_more,
        "total": total_courses
    }

@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await course_collection.find_one({"_id": ObjectId(course_id)})
    if course:
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    raise HTTPException(status_code=404, detail="Course not found")

@router.post("/search-courses")
async def search_courses(search_input: SearchInput, current_user: UserInDB = Depends(get_current_active_user)):
    try:
        # Get embedding for search term
        response = client.embeddings.create(
            input=search_input.text,
            model="text-embedding-3-small"
        )
        search_embedding = response.data[0].embedding
        
        # Check if index needs to be built/rebuilt
        if not vector_search.index or \
           (vector_search.last_update and (datetime.now() - vector_search.last_update).days > 0):
            await vector_search.build_index(course_collection)
        
        # Get similar courses using FAISS, limit to 18 results
        similar_courses = await vector_search.search(search_embedding, k=18)  # Set k=18 to limit results
        
        # Fetch full course details for matched IDs
        courses_with_scores = []
        for match in similar_courses:
            course = await course_collection.find_one({"_id": ObjectId(match['id'])})
            if course:
                courses_with_scores.append({
                    'id': str(course['_id']),
                    'title': course['title'],
                    'credits': course['credits'],
                    'similarity': match['similarity']
                })
        
        return courses_with_scores

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add startup event to app's main.py
@router.on_event("startup")
async def startup_event():
    await vector_search.build_index(course_collection)