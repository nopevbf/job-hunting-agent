import re
from typing import Tuple, Dict, Any, List
from database.models import JobPost

class JobFilter:
    def __init__(self, preferences: Dict[str, Any]):
        self.target_roles: List[str] = preferences.get("target_roles", [])
        self.target_locations: List[str] = [loc.lower() for loc in preferences.get("target_locations", [])]
        self.minimum_salary: int = preferences.get("minimum_salary", 0)
        self.max_experience_requirement: int = preferences.get("max_experience_requirement", 99)
        self.exclude_keywords: List[str] = preferences.get("exclude_keywords", [])

    def evaluate(self, job: JobPost) -> Tuple[bool, str]:
        """
        Evaluate if a job post meets filtering criteria.
        Returns:
            (is_valid: bool, reason: str)
        """
        # 1. Check Excluded Keywords
        for kw in self.exclude_keywords:
            pattern = re.compile(rf"\b{re.escape(kw)}\b", re.IGNORECASE)
            if pattern.search(job.position):
                return False, f"Excluded keyword '{kw}' found in title: {job.position}"
            if pattern.search(job.job_description):
                return False, f"Excluded keyword '{kw}' found in job description"

        # 2. Check Experience Requirements (BVA)
        if job.min_experience_years is not None:
            if job.min_experience_years > self.max_experience_requirement:
                return False, (
                    f"Experience requirement ({job.min_experience_years}) exceeds "
                    f"max ({self.max_experience_requirement})"
                )

        # 3. Check Salary Threshold (BVA)
        effective_salary = job.salary_max or job.salary_min
        if effective_salary is not None and effective_salary > 0:
            if effective_salary < self.minimum_salary:
                return False, (
                    f"Salary below minimum: max offered {effective_salary:,} < "
                    f"required {self.minimum_salary:,}"
                )

        # 4. Check Location Compatibility
        if self.target_locations:
            job_loc = (job.location or "").lower()
            matched_loc = any(target in job_loc for target in self.target_locations)
            if not matched_loc:
                return False, f"Location '{job.location}' not in target locations ({', '.join(self.target_locations)})"

        return True, "Passed"
