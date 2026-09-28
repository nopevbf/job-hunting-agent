import os
import logging
from typing import Dict, Any, List
from database.models import JobPost
from browser.base import BaseJobScraper

logger = logging.getLogger(__name__)

class GlintsScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(source_name="Glints")

    def normalize_job(self, raw_data: Dict[str, Any]) -> JobPost:
        """
        Normalize raw Glints job card into unified JobPost model.
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

    def scrape(self, keyword: str = "QA Engineer", country: str = "ID", limit: int = 10) -> List[JobPost]:
        """
        Scrape live jobs directly from Glints Indonesia using Playwright Chrome.
        """
        from playwright.sync_api import sync_playwright
        import time
        import urllib.parse

        kw_encoded = urllib.parse.quote(keyword)
        url = f"https://glints.com/id/en/opportunities/jobs/explore?keyword={kw_encoded}&country={country}"
        jobs: List[JobPost] = []

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(channel=self.channel, headless=self.headless)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                page.goto(url, timeout=30000)
                time.sleep(3)

                cards = page.query_selector_all("a[href*='/opportunities/jobs/']")
                seen_urls = set()
                for c in cards:
                    if len(jobs) >= limit:
                        break
                    href = c.get_attribute("href") or ""
                    if not href or href in seen_urls:
                        continue
                    if not href.startswith("http"):
                        href = "https://glints.com" + href

                    seen_urls.add(href)
                    text = c.inner_text().strip()
                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    if len(lines) >= 2:
                        title = lines[0]
                        company = lines[1]
                        location = lines[2] if len(lines) > 2 else "Indonesia"
                        salary = ""
                        for line in lines:
                            if "idr" in line.lower() or "rp" in line.lower():
                                salary = line
                                break

                        raw_data = {
                            "title": title,
                            "company": company,
                            "location": location,
                            "salary": salary,
                            "url": href,
                            "description": text
                        }
                        jobs.append(self.normalize_job(raw_data))

                browser.close()
        except Exception as e:
            logger.error(f"Error during Glints live scraping: {e}")

        return jobs
