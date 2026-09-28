import re
from enum import Enum
from typing import Dict, Any, List, Set
from pydantic import BaseModel, Field
from database.models import JobPost

class MatchClassification(str, Enum):
    EXCELLENT_MATCH = "Excellent Match"
    STRONG_MATCH = "Strong Match"
    GOOD_MATCH = "Good Match"
    REVIEW = "Review"
    LOW_MATCH = "Low Match"

class MatchResult(BaseModel):
    total_score: float
    classification: MatchClassification
    matched_skills: List[str] = Field(default_factory=list)
    partial_skills: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    breakdown: Dict[str, float] = Field(default_factory=dict)

class JobMatcher:
    def __init__(self, profile: Dict[str, Any]):
        self.profile = profile
        self.user_skills: Set[str] = self._extract_all_user_skills()
        self.user_years_exp = profile.get("screening_defaults", {}).get("years_of_experience", 4)
        self.user_location = profile.get("location", "Yogyakarta").lower()
        self.user_min_salary = profile.get("screening_defaults", {}).get("minimum_salary", 8000000)

    def _extract_all_user_skills(self) -> Set[str]:
        skills_set = set()
        skills_dict = self.profile.get("skills", {})
        for cat, items in skills_dict.items():
            for item in items:
                skills_set.add(item.lower().strip())
        return skills_set

    def classify_score(self, score: float) -> MatchClassification:
        if score >= 90.0:
            return MatchClassification.EXCELLENT_MATCH
        elif score >= 80.0:
            return MatchClassification.STRONG_MATCH
        elif score >= 70.0:
            return MatchClassification.GOOD_MATCH
        elif score >= 60.0:
            return MatchClassification.REVIEW
        else:
            return MatchClassification.LOW_MATCH

    def calculate_match(self, job: JobPost) -> MatchResult:
        """
        Calculate weighted match score and gap analysis.
        Weights:
        - Skills: 35%
        - Responsibilities / Title: 20%
        - Experience: 15%
        - Location: 10%
        - Salary: 10%
        - Tools / Tech: 10%
        """
        matched_skills = []
        gaps = []
        partial_skills = []

        # 1. Skill & Requirements Analysis
        reqs = job.requirements or []
        if not reqs and job.job_description:
            # Fallback extract some common terms from JD if requirements list empty
            reqs = [s for s in ["manual testing", "api testing", "sql", "playwright", "cypress", "postman"] if s in job.job_description.lower()]

        if reqs:
            for req in reqs:
                req_clean = req.lower().strip()
                # Check direct or substring match against user skills
                found = False
                for u_skill in self.user_skills:
                    if u_skill in req_clean or req_clean in u_skill:
                        matched_skills.append(req)
                        found = True
                        break
                if not found:
                    gaps.append(req)
            skill_ratio = len(matched_skills) / len(reqs) if reqs else 1.0
        else:
            skill_ratio = 1.0

        skill_score = skill_ratio * 35.0

        # 2. Role / Position Match (20%)
        title_lower = job.position.lower()
        pref_title = self.profile.get("title", "").lower()
        if "qa" in title_lower or "quality assurance" in title_lower or "system analyst" in title_lower:
            role_score = 20.0
        elif pref_title and any(word in title_lower for word in pref_title.split()):
            role_score = 15.0
        else:
            role_score = 10.0

        # 3. Experience Match (15%)
        job_exp = job.min_experience_years or 0
        if job_exp <= self.user_years_exp:
            exp_score = 15.0
        elif job_exp == self.user_years_exp + 1:
            exp_score = 10.0
        else:
            exp_score = 5.0

        # 4. Location Match (10%)
        job_loc = (job.location or "").lower()
        if "remote" in job_loc:
            loc_score = 10.0
        elif self.user_location in job_loc:
            loc_score = 10.0
        else:
            loc_score = 5.0

        # 5. Salary Match (10%)
        if job.salary_max:
            if job.salary_max >= self.user_min_salary:
                salary_score = 10.0
            else:
                salary_score = 3.0
        else:
            salary_score = 8.0  # undisclosed salary gets neutral-high score

        # 6. Tools / Tech Coverage (10%)
        # Check presence of primary tools (Postman, Playwright, SQL) in job description
        tools_found = 0
        tools_checked = ["playwright", "postman", "sql"]
        desc_lower = (job.job_description or "").lower()
        for t in tools_checked:
            if t in desc_lower:
                tools_found += 1
        tools_score = (tools_found / len(tools_checked)) * 10.0 if tools_checked else 10.0

        total = round(skill_score + role_score + exp_score + loc_score + salary_score + tools_score, 1)
        total = min(100.0, max(0.0, total))

        classification = self.classify_score(total)

        breakdown = {
            "skills": round(skill_score, 1),
            "role": round(role_score, 1),
            "experience": round(exp_score, 1),
            "location": round(loc_score, 1),
            "salary": round(salary_score, 1),
            "tools": round(tools_score, 1)
        }

        return MatchResult(
            total_score=total,
            classification=classification,
            matched_skills=matched_skills,
            partial_skills=partial_skills,
            gaps=gaps,
            breakdown=breakdown
        )
