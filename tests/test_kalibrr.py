import pytest
from database.models import JobPost
from browser.kalibrr import KalibrrScraper

def test_kalibrr_scraper_normalize_job():
    """SRCH-POR-001: Kalibrr raw JSON item properly normalized to JobPost."""
    scraper = KalibrrScraper()
    raw_item = {
        "id": 262843,
        "name": "QA Automation & Performance Test",
        "company": {
            "name": "Dans Multi Pro",
            "code": "dans-multi-pro"
        },
        "google_location": {
            "address_components": {
                "city": "South Jakarta"
            }
        },
        "description": "Experience in Selenium, JMeter, and API testing with Postman.",
        "salary_range": "IDR 10.000.000 - 15.000.000"
    }

    job = scraper.normalize_job(raw_item)
    assert isinstance(job, JobPost)
    assert job.source == "Kalibrr"
    assert job.company == "Dans Multi Pro"
    assert job.position == "QA Automation & Performance Test"
    assert job.location == "South Jakarta"
    assert job.job_url == "https://www.kalibrr.com/c/dans-multi-pro/sub/262843"
    assert "Selenium" in job.requirements or "Manual Testing" in job.requirements or "API Testing" in job.requirements
    assert job.salary_min == 10000000
    assert job.salary_max == 15000000
