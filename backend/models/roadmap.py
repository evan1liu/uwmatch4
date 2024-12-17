from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoadmapEntry(BaseModel):
    courseId: str
    year: int
    term: str

class Roadmap(BaseModel):
    userId: str
    courseId: str
    year: int
    term: str
    addedAt: datetime = datetime.utcnow()

    class Config:
        schema_extra = {
            "example": {
                "userId": "user123",
                "courseId": "course456",
                "year": 2024,
                "term": "Fall",
                "addedAt": datetime.utcnow()
            }
        } 

class RoadmapChange(BaseModel):
    courseId: str
    toYear: Optional[int]
    toTerm: Optional[str]
    fromYear: Optional[int] = None
    fromTerm: Optional[str] = None
    toTrash: Optional[bool] = False  # New field for trash operations