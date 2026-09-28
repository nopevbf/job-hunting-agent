from typing import List, Optional
from pydantic import BaseModel, Field

class JobExtractionSchema(BaseModel):
    position: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    requirements: List[str] = Field(default_factory=list)
    nice_to_haves: List[str] = Field(default_factory=list)
    min_experience_years: Optional[int] = None
    max_experience_years: Optional[int] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    domain: Optional[str] = None
    tools: List[str] = Field(default_factory=list)
