import os
import logging
from typing import Dict, Any, List
from database.models import JobPost
from browser.base import BaseJobScraper

logger = logging.getLogger(__name__)

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

    def scrape(self, keyword: str = "QA-Engineer", location: str = "Indonesia", limit: int = 10) -> List[JobPost]:
        """
        Scrape live jobs directly from JobStreet Indonesia using Playwright Chrome.
        """
        from playwright.sync_api import sync_playwright
        import time

        formatted_kw = keyword.replace(" ", "-")
        url = f"https://id.jobstreet.com/id/{formatted_kw}-jobs"
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

                articles = page.query_selector_all("article")
                for a in articles:
                    if len(jobs) >= limit:
                        break
                    title_el = a.query_selector("a[data-automation='jobTitle']") or a.query_selector("h3 a") or a.query_selector("a")
                    comp_el = a.query_selector("a[data-automation='jobCompany']")
                    loc_el = a.query_selector("a[data-automation='jobLocation']")
                    sal_el = a.query_selector("span[data-automation='jobSalary']")
                    desc_el = a.query_selector("span[data-automation='jobShortDescription']") or a.query_selector("p")

                    title = title_el.inner_text().strip() if title_el else ""
                    href = title_el.get_attribute("href") if title_el else ""
                    if href and not href.startswith("http"):
                        href = "https://id.jobstreet.com" + href
                    company = comp_el.inner_text().strip() if comp_el else "Confidential"
                    loc = loc_el.inner_text().strip() if loc_el else location
                    salary = sal_el.inner_text().strip() if sal_el else ""
                    description = desc_el.inner_text().strip() if desc_el else title

                    if title and href:
                        raw_data = {
                            "title": title,
                            "company": company,
                            "location": loc,
                            "salary": salary,
                            "url": href,
                            "description": description
                        }
                        jobs.append(self.normalize_job(raw_data))

                browser.close()
        except Exception as e:
            logger.error(f"Error during JobStreet live scraping: {e}")

        return jobs
