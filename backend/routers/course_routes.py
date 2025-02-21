from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
import os
from openai import OpenAI
from ..database import course_collection
from ..models.course import Course
from ..models.search import SearchInput
from ..models.user import UserInDB
from ..auth import get_current_active_user
from ..vector_search import vector_search
import asyncio
import logging
import numpy as np

router = APIRouter()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@router.get("/courses")
async def get_courses(
    # "Query" is a Fast API class
    # the "page" value is based on where the user is scrolling to
    page: int = Query(1, ge=1),
):
    limit = 18
    skip = (page - 1) * limit
    
    # "Projection" is a Python dictionary that tells MongoDB what fields
    # we want to return when we turn the cursor into a list
    # number "1" means we want to return the field,
    # and all other fields we're not returning
    projection = {
        "_id": 1,  # Always include _id for conversion to string id
        "title": 1,
        "credits": 1,
        # Add other fields you want to include
    }
    
    # Total number of courses in the database
    total_courses: int = await course_collection.count_documents({})
    
    # "cursor" is just a "query", a "plan" of how we'll be fetching the data
    # to_list() is where we actually executes the query and get the data
    # when we use find({}), that means we're not filtering any data
    # we're just fetching the data based on the order of the data in the database
    cursor = course_collection.find({}, projection).skip(skip).limit(limit)
    courses = await cursor.to_list()
    
    # This converts the MongoDB ObjectId into a normal string id
    for course in courses:
        course["id"] = str(course["_id"])
        del course["_id"]
    
    return {
        "courses": courses,
        "has_more": (skip + limit) < total_courses,
        "total": total_courses
    }

@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    
    projection = {
        "_id": 1,
        "title": 1,
        "course_designation": 1, # check with frontend, the course designation isn't showing
        "credits": 1,
        "description": 1,
        "last_taught": 1,
        "learning_outcomes": 1,
        "repeatable": 1,
        "requisites": 1
    }
    
    course = await course_collection.find_one({"_id": ObjectId(course_id)}, projection)
    
    if course:
        course["id"] = str(course["_id"])
        del course["_id"]
        return course
    
    raise HTTPException(status_code=404, detail="Course not found")

@router.post("/search-courses")
async def search_courses(search_input: SearchInput):
    try:
        logging.info("=== Search Request ===")
        # Capitalize the search text
        capitalized_search = search_input.text.upper()
        logging.info(f"Original search text: {search_input.text}")
        logging.info(f"Capitalized search text: {capitalized_search}")
        
        use_code_embedding = any(
            capitalized_search[i:i+3].isdigit() 
            for i in range(len(capitalized_search)-2)
        )
        logging.info(f"Detected course code? {use_code_embedding}")
        logging.info(f"Using {'code_embeddings' if use_code_embedding else 'title_embedding'} for search")
        
        # Get embedding for capitalized search term
        response = client.embeddings.create(
            input=capitalized_search,
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