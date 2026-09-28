from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ApplicationStatus(str, Enum):
    NEW = "NEW"
    REVIEW = "REVIEW"
    NEED_REVIEW = "NEED_REVIEW"
    READY_TO_APPLY = "READY_TO_APPLY"
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    REJECTED = "REJECTED"
    OFFER = "OFFER"
    SKIPPED = "SKIPPED"
    CLOSED = "CLOSED"

class JobPost(BaseModel):
    id: Optional[int] = None
    source: str
    company: str
    position: str
    location: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_url: str
    job_description: str
    requirements: List[str] = Field(default_factory=list)
    min_experience_years: Optional[int] = None
    max_experience_years: Optional[int] = None
    match_score: Optional[float] = None
    status: ApplicationStatus = ApplicationStatus.NEW
    cv_file: Optional[str] = None
    cover_letter_file: Optional[str] = None
    snapshot_data: Optional[str] = None
    discovered_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    applied_at: Optional[str] = None
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
