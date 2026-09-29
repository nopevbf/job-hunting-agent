import pytest
import httpx
from unittest.mock import patch, MagicMock
from browser.linkedin import LinkedInScraper
from database.models import JobPost

SAMPLE_LINKEDIN_HTML = """
<ul class="jobs-search__results-list">
  <li>
    <div class="base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card">
      <a class="base-card__full-link absolute top-0 right-0 bottom-0 left-0 p-0 z-[2]" href="https://id.linkedin.com/jobs/view/quality-assurance-engineer-at-nawadata-4320101292?position=1&amp;pageNum=0">
        <span class="sr-only">Quality Assurance Engineer</span>
      </a>
      <div class="base-search-card__info">
        <h3 class="base-search-card__title">Quality Assurance Engineer</h3>
        <h4 class="base-search-card__subtitle">
          <a class="hidden-nested-link" href="https://id.linkedin.com/company/nawadata">NawaData</a>
        </h4>
        <div class="base-search-card__metadata">
          <span class="job-search-card__location">Jakarta, Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  </li>
  <li>
    <div class="base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card">
      <a class="base-card__full-link absolute top-0 right-0 bottom-0 left-0 p-0 z-[2]" href="https://id.linkedin.com/jobs/view/qa-engineer-at-bibit-4409276978?tracking=xyz">
        <span class="sr-only">QA Engineer for Stockbit</span>
      </a>
      <div class="base-search-card__info">
        <h3 class="base-search-card__title">QA Engineer for Stockbit</h3>
        <h4 class="base-search-card__subtitle">Bibit.id</h4>
        <div class="base-search-card__metadata">
          <span class="job-search-card__location">Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  </li>
</ul>
"""

def test_linkedin_scraper_parse_jobs():
    scraper = LinkedInScraper()
    jobs = scraper.parse_html_cards(SAMPLE_LINKEDIN_HTML)

    assert len(jobs) == 2
    assert all(isinstance(j, JobPost) for j in jobs)
    assert jobs[0].company == "NawaData"
    assert jobs[0].position == "Quality Assurance Engineer"
    assert jobs[0].source == "LinkedIn"
    assert jobs[0].job_url == "https://id.linkedin.com/jobs/view/quality-assurance-engineer-at-nawadata-4320101292"
    assert jobs[0].location == "Jakarta, Jakarta, Indonesia"

    assert jobs[1].company == "Bibit.id"
    assert jobs[1].position == "QA Engineer for Stockbit"
    assert jobs[1].job_url == "https://id.linkedin.com/jobs/view/qa-engineer-at-bibit-4409276978"

def test_linkedin_scraper_empty_html_bva():
    scraper = LinkedInScraper()
    assert scraper.parse_html_cards("") == []
    assert scraper.parse_html_cards("<div>No jobs found</div>") == []

@patch.object(httpx.Client, "get")
def test_linkedin_scraper_network_timeout_fallback(mock_get):
    mock_get.side_effect = httpx.TimeoutException("Connection timed out")
    scraper = LinkedInScraper()
    jobs = scraper.search_jobs("QA Engineer", location="Indonesia")
    assert jobs == []
