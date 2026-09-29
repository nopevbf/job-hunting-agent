import re
import logging
from typing import List
from datetime import datetime
import httpx
from database.models import JobPost, ApplicationStatus

logger = logging.getLogger(__name__)

class LinkedInScraper:
    """
    Scraper for LinkedIn job postings using public guest API endpoints.
    Does not require login or credentials.
    """
    GUEST_SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    DEFAULT_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    def parse_html_cards(self, html: str) -> List[JobPost]:
        """Parse HTML cards returned by LinkedIn guest API into JobPost models."""
        if not html:
            return []

        jobs: List[JobPost] = []
        # Match each base-search-card block
        card_regex = re.compile(
            r'<div[^>]*class="[^"]*base-search-card[^"]*"[^>]*>(.*?)</li>',
            re.IGNORECASE | re.DOTALL,
        )

        title_regex = re.compile(
            r'<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>\s*(.*?)\s*</h3>',
            re.IGNORECASE | re.DOTALL,
        )
        company_regex = re.compile(
            r'<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>\s*(.*?)\s*</a>|<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>\s*(.*?)\s*</h4>',
            re.IGNORECASE | re.DOTALL,
        )
        location_regex = re.compile(
            r'<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>\s*(.*?)\s*</span>',
            re.IGNORECASE | re.DOTALL,
        )
        link_regex = re.compile(
            r'<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]*)"',
            re.IGNORECASE,
        )

        clean_html = re.compile(r"<[^>]+>")

        for match in card_regex.finditer(html):
            block = match.group(1)

            t_match = title_regex.search(block)
            raw_title = clean_html.sub("", t_match.group(1)).strip() if t_match else ""
            if not raw_title:
                continue

            c_match = company_regex.search(block)
            raw_comp = ""
            if c_match:
                raw_comp = c_match.group(1) or c_match.group(2) or ""
                raw_comp = clean_html.sub("", raw_comp).strip()
            if not raw_comp:
                raw_comp = "Confidential"

            loc_match = location_regex.search(block)
            raw_loc = clean_html.sub("", loc_match.group(1)).strip() if loc_match else "Indonesia"

            l_match = link_regex.search(block)
            raw_url = l_match.group(1).split("?")[0].strip() if l_match else ""
            if not raw_url:
                continue

            now = datetime.now().isoformat()
            job = JobPost(
                source="LinkedIn",
                company=raw_comp,
                position=raw_title,
                location=raw_loc,
                salary_min=None,
                salary_max=None,
                job_url=raw_url,
                job_description=f"Job opportunity at {raw_comp} for {raw_title} in {raw_loc}.",
                requirements=["Manual Testing", "API Testing", "Playwright", "SQL", "Selenium"],
                min_experience_years=None,
                max_experience_years=None,
                status=ApplicationStatus.NEW,
                discovered_at=now,
                updated_at=now,
            )
            jobs.append(job)

        return jobs

    def search_jobs(self, query: str, location: str = "Indonesia", max_results: int = 10) -> List[JobPost]:
        """Fetch and parse live jobs from LinkedIn guest API."""
        params = {
            "keywords": query,
            "location": location,
            "start": 0,
        }
        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                res = client.get(self.GUEST_SEARCH_URL, params=params, headers=self.DEFAULT_HEADERS)
                if res.status_code == 200:
                    jobs = self.parse_html_cards(res.text)
                    return jobs[:max_results]
                else:
                    logger.warning(f"LinkedIn guest API returned status code {res.status_code}")
                    return []
        except Exception as e:
            logger.warning(f"Notice: LinkedIn search failed gracefully: {e}")
            return []
