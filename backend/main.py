from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.routers import api_router
from app.database import course_collection

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API router
app.include_router(api_router, prefix="/api")

# If there's no environment variable named ENV, default it to 'development'
ENV = settings.ENV

if ENV == 'production':
    # Serve static files first
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse("frontend/dist/index.html")

    # Mount the root last
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")