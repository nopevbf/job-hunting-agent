import pytest
from database.models import JobPost
from browser.glints import GlintsScraper
from browser.jobstreet import JobStreetScraper

def test_glints_scraper_parse_card():
    """Verify parsing and normalization of Glints raw job card data."""
    scraper = GlintsScraper()
    raw_card = {
        "title": "QA Automation Engineer",
        "company": "Traveloka",
        "location": "Yogyakarta, Indonesia",
        "salary": "IDR 12.000.000 - 18.000.000",
        "url": "https://glints.com/id/opportunities/jobs/qa-automation-123",
        "description": "Designing and executing automation test scripts using Playwright and Postman. Minimum 3 years experience."
    }

    job: JobPost = scraper.normalize_job(raw_card)
    assert job.source == "Glints"
    assert job.company == "Traveloka"
    assert job.position == "QA Automation Engineer"
    assert job.location == "Yogyakarta, Indonesia"
    assert job.salary_min == 12000000
    assert job.salary_max == 18000000
    assert job.min_experience_years == 3
    assert "Playwright" in job.requirements or "Postman" in job.requirements

def test_jobstreet_scraper_parse_card():
    """Verify parsing and normalization of JobStreet raw job card data."""
    scraper = JobStreetScraper()
    raw_card = {
        "title": "System Analyst / QA Lead",
        "company": "PT BCA Finance",
        "location": "Remote",
        "salary": "Rp 15.000.000 - Rp 20.000.000 / month",
        "url": "https://www.jobstreet.co.id/job/78910",
        "description": "Require SQL, API Testing, and Manual Testing. 4 years minimum experience."
    }

    job: JobPost = scraper.normalize_job(raw_card)
    assert job.source == "JobStreet"
    assert job.company == "PT BCA Finance"
    assert job.salary_min == 15000000
    assert job.salary_max == 20000000
    assert job.min_experience_years == 4
    assert job.location == "Remote"

def test_scrapers_expose_real_scrape_interface():
    """Ensure both scrapers implement the real scrape() method."""
    js = JobStreetScraper()
    assert hasattr(js, "scrape")
    assert callable(js.scrape)

    gl = GlintsScraper()
    assert hasattr(gl, "scrape")
    assert callable(gl.scrape)

def test_app_does_not_contain_hardcoded_sample_feeds():
    """Verify that app.py does not contain hardcoded dummy sample feeds."""
    from pathlib import Path
    app_code = Path("app.py").read_text(encoding="utf-8")
    assert "sample_scraped_feeds" not in app_code, "app.py still contains hardcoded dummy feeds!"

