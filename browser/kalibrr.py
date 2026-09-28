import os
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, List
from database.models import JobPost
from browser.base import BaseJobScraper

logger = logging.getLogger(__name__)

class KalibrrScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(source_name="Kalibrr")

    def normalize_job(self, raw_data: Dict[str, Any]) -> JobPost:
        """
        Normalize raw Kalibrr JSON item into unified JobPost model.
        """
        title = (raw_data.get("name") or "").strip()
        comp_obj = raw_data.get("company") or {}
        company = (comp_obj.get("name") or "Confidential").strip()
        comp_code = comp_obj.get("code") or "company"
        job_id = raw_data.get("id") or ""

        # Location extraction from Kalibrr nested structure
        loc_components = (
            raw_data.get("google_location", {})
            .get("address_components", {})
        )
        city = loc_components.get("city") or loc_components.get("province") or "Indonesia"

        job_url = f"https://www.kalibrr.com/c/{comp_code}/sub/{job_id}"
        description = (raw_data.get("description") or title).strip()
        salary_text = raw_data.get("salary_range") or ""

        sal_min, sal_max = self.parse_salary(salary_text)
        exp_years = self.extract_experience(description)
        skills = self.extract_skills_from_text(description + " " + title)

        return JobPost(
            source=self.source_name,
            company=company,
            position=title,
            location=city,
            salary_min=sal_min,
            salary_max=sal_max,
            job_url=job_url,
            job_description=description,
            requirements=skills,
            min_experience_years=exp_years
        )

    def scrape(self, keyword: str = "QA Engineer", limit: int = 15) -> List[JobPost]:
        """
        Scrape live jobs directly from Kalibrr Indonesia official REST API.
        """
        jobs: List[JobPost] = []
        kw_encoded = urllib.parse.quote_plus(keyword)
        url = f"https://www.kalibrr.com/api/job_board/search?text={kw_encoded}&limit={limit}"

        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    payload = json.loads(resp.read().decode("utf-8"))
                    raw_jobs = payload.get("jobs", [])
                    for item in raw_jobs:
                        if len(jobs) >= limit:
                            break
                        if item.get("name") and item.get("id"):
                            jobs.append(self.normalize_job(item))
        except Exception as e:
            logger.error(f"Error during Kalibrr live API fetch: {e}")

        return jobs
