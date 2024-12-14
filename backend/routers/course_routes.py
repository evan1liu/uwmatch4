from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
import os
from openai import OpenAI
from backend.database import course_collection
from backend.models import Course, SearchInput, UserInDB
from backend.auth import get_current_active_user
from ..vector_search import vector_search
import asyncio
import logging
import numpy as np

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
        logging.info("=== Search Request ===")
        logging.info(f"Search text: {search_input.text}")
        
        use_code_embedding = any(
            search_input.text[i:i+3].isdigit() 
            for i in range(len(search_input.text)-2)
        )
        logging.info(f"Detected course code? {use_code_embedding}")
        logging.info(f"Using {'code_embeddings' if use_code_embedding else 'title_embedding'} for search")
        
        # Get embedding for search term
        response = client.embeddings.create(
            input=search_input.text,
            model="text-embedding-3-small"
        )
        search_embedding = response.data[0].embedding

        # Normalize the search embedding
        norm = np.linalg.norm(search_embedding)
        if norm > 0:
            search_embedding = [x / norm for x in search_embedding]
        else:
            logging.warning("Received zero vector as search embedding")
        
        logging.info("Generated and normalized embedding successfully")
        
        # Check if index needs to be built/rebuilt
        if not (vector_search.code_index if use_code_embedding else vector_search.title_index) or \
           (vector_search.last_update and (datetime.now() - vector_search.last_update).days > 0):
            logging.info("Building/rebuilding index...")
            await vector_search.build_index(course_collection, use_code_embedding)
        
        # Get similar courses using FAISS
        similar_courses = await vector_search.search(
            search_embedding, 
            k=18,
            use_code_embedding=use_code_embedding
        )
        logging.info(f"Found {len(similar_courses)} similar courses")
        
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
        
        if courses_with_scores:
            logging.info(f"Top match: {courses_with_scores[0]}")
        else:
            logging.info("No matches found.")
        
        logging.info("=== Search Complete ===")
        
        return courses_with_scores

    except Exception as e:
        logging.error(f"Error in search_courses: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Add startup event to app's main.py
@router.on_event("startup")
async def startup_event():
    # Build both indexes at startup
    await asyncio.gather(
        vector_search.build_index(course_collection, use_code_embedding=False),  # title index
        vector_search.build_index(course_collection, use_code_embedding=True)    # code index
    )
    logging.info("Successfully built both title and code indexes at startup")

@router.get("/search")
async def search_courses(query: str):
    if not vector_search.index:
        raise HTTPException(status_code=503, detail="Search service initializing, please try again later.")
    
    # Proceed with search