from pydantic import BaseModel

class SearchInput(BaseModel):
    text: str 