import re
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple
from database.models import JobPost

class DecisionAction(str, Enum):
    AUTO_APPLY = "AUTO_APPLY"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    NEED_REVIEW = "NEED_REVIEW"
    SKIP = "SKIP"

class ScreeningEvaluator:
    def __init__(self, profile: Dict[str, Any], preferences: Dict[str, Any]):
        self.profile = profile
        self.preferences = preferences
        self.defaults = profile.get("screening_defaults", {})
        self.target_locations = [loc.lower() for loc in preferences.get("target_locations", [])]
        self.target_roles = [role.lower() for role in preferences.get("target_roles", [])]
        self.min_salary = preferences.get("minimum_salary", 8000000)

    def resolve_question(self, question_text: str) -> Optional[Any]:
        """
        Resolve factual or saved screening questions without guessing.
        Returns the resolved answer or None if human review is needed.
        """
        q = question_text.lower()

        # 1. Name
        if re.search(r"\b(full\s*name|nama\s*lengkap|name)\b", q):
            return self.profile.get("name")

        # 2. Email
        if re.search(r"\b(email|surel)\b", q):
            return self.profile.get("email")

        # 3. Phone
        if re.search(r"\b(phone|mobile|telepon|handphone|nomor\s*hp|wa)\b", q):
            return self.profile.get("phone")

        # 4. Location / City
        if re.search(r"\b(city|domisili|kota|current\s*location|tinggal)\b", q):
            return self.profile.get("location")

        # 5. Salary
        if re.search(r"\b(expected\s*salary|gaji\s*yang\s*diharapkan|salary\s*expectation|desired\s*salary)\b", q):
            return self.defaults.get("expected_salary")

        # 6. Years of Experience
        if re.search(r"\b(years\s*of\s*experience|tahun\s*pengalaman|pengalaman\s*kerja)\b", q):
            return self.defaults.get("years_of_experience")

        # 7. Notice Period
        if re.search(r"\b(notice\s*period|kapan\s*bisa\s*bergabung|availability)\b", q):
            return self.defaults.get("notice_period_days")

        # 8. Relocation
        if re.search(r"\b(relocate|relokasi|bersedia\s*pindah)\b", q):
            return self.defaults.get("willing_to_relocate")

        # 9. Work Authorization / Nationality
        if re.search(r"\b(work\s*authorization|kewarganegaraan|citizen|visa)\b", q):
            return self.defaults.get("work_authorization", "Indonesian Citizen")

        # Unresolved question requires user decision
        return None

    def evaluate_application_action(
        self,
        job: JobPost,
        questions: Optional[List[str]] = None
    ) -> Tuple[DecisionAction, str]:
        """
        ISTQB Decision Table evaluation:
        - Check unresolved questions -> NEED_REVIEW
        - Check low score (< 60) -> SKIP
        - Check strict Auto-Apply rule (score >= 85, location, salary, category) -> AUTO_APPLY
        - Otherwise -> WAITING_APPROVAL
        """
        questions = questions or []
        unresolved = []
        for q in questions:
            ans = self.resolve_question(q)
            if ans is None:
                unresolved.append(q)

        if unresolved:
            return (
                DecisionAction.NEED_REVIEW,
                f"Unresolved screening questions require user review: {', '.join(unresolved)}"
            )

        score = job.match_score or 0.0

        if score < 60.0:
            return DecisionAction.SKIP, f"Match score ({score}) is below minimum threshold (60)"

        # Check conditions for Mode 3: Auto-Apply
        # 1. Match score >= 85
        score_ok = score >= 85.0

        # 2. Location in Remote or target locations
        job_loc = (job.location or "").lower()
        loc_ok = any(t in job_loc for t in self.target_locations) or "remote" in job_loc

        # 3. Salary >= minimum_salary
        eff_salary = job.salary_min or job.salary_max
        salary_ok = eff_salary is None or eff_salary >= self.min_salary

        # 4. Job category in target roles
        job_pos = (job.position or "").lower()
        cat_ok = any(r in job_pos for r in self.target_roles) or "qa" in job_pos or "system analyst" in job_pos

        if score_ok and loc_ok and salary_ok and cat_ok and not questions:
            return DecisionAction.AUTO_APPLY, "All criteria satisfied for auto-application"

        return DecisionAction.WAITING_APPROVAL, "Job ready for user approval before submission"
