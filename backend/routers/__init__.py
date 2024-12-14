from fastapi import APIRouter
api_router = APIRouter()

from .auth_routes import router as auth_router
from .user_routes import router as user_router
from .course_routes import router as course_router
from .saved_course_routes import router as saved_course_router
from .roadmap_routes import router as roadmap_router
api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(course_router)
api_router.include_router(saved_course_router)
api_router.include_router(roadmap_router)