from typing import Dict, Any, List
from database.models import JobPost
from browser.base import BaseJobScraper

class JobStreetScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(source_name="JobStreet")

    def normalize_job(self, raw_data: Dict[str, Any]) -> JobPost:
        """
        Normalize raw JobStreet job card into unified JobPost model.
        """
        title = raw_data.get("title", "").strip()
        company = raw_data.get("company", "").strip()
        location = raw_data.get("location", "Indonesia").strip()
        url = raw_data.get("url", "").strip()
        description = raw_data.get("description", "").strip()
        salary_text = raw_data.get("salary", "")

        sal_min, sal_max = self.parse_salary(salary_text)
        exp_years = self.extract_experience(description)
        skills = self.extract_skills_from_text(description + " " + title)

        return JobPost(
            source=self.source_name,
            company=company,
            position=title,
            location=location,
            salary_min=sal_min,
            salary_max=sal_max,
            job_url=url,
            job_description=description,
            requirements=skills,
            min_experience_years=exp_years
        )
