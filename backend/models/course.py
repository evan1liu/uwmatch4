from pydantic import BaseModel
from typing import Optional

class Course(BaseModel):
    title: str
    credits: int
    course_designation: Optional[str] = None
    description: Optional[str] = None
    last_taught: Optional[str] = None
    learning_outcomes: Optional[str] = None
    repeatable: Optional[bool] = None
    requisites: Optional[str] = None 