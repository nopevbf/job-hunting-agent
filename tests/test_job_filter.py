import pytest
from database.models import JobPost
from agent.job_filter import JobFilter

@pytest.fixture
def job_filter(sample_preferences_data):
    return JobFilter(preferences=sample_preferences_data)

def test_filter_pass_valid_job(job_filter, sample_job_post):
    """Happy path: job meets all criteria."""
    job = JobPost(**sample_job_post)
    is_valid, reason = job_filter.evaluate(job)
    assert is_valid is True
    assert reason == "Passed"

def test_filter_rejects_excluded_keywords(job_filter, sample_job_post):
    """Equivalence Partitioning: Title or JD with excluded keyword is rejected."""
    job_dict = dict(sample_job_post)
    job_dict["position"] = "QA Engineer & Sales Executive"
    job = JobPost(**job_dict)
    is_valid, reason = job_filter.evaluate(job)
    assert is_valid is False
    assert "Excluded keyword 'Sales'" in reason

    # Test keyword in job_description
    job_dict2 = dict(sample_job_post)
    job_dict2["job_description"] = "This is a Commission Only QA role."
    job2 = JobPost(**job_dict2)
    is_valid2, reason2 = job_filter.evaluate(job2)
    assert is_valid2 is False
    assert "Commission Only" in reason2

def test_filter_salary_bva(job_filter, sample_job_post):
    """Boundary Value Analysis on Salary (min_salary = 8,000,000)."""
    # Just below boundary: 7,999,999 -> Reject
    job_below = JobPost(**dict(sample_job_post, salary_max=7999999, salary_min=6000000))
    is_valid, reason = job_filter.evaluate(job_below)
    assert is_valid is False
    assert "Salary below minimum" in reason

    # Exactly at boundary: 8,000,000 -> Pass
    job_at = JobPost(**dict(sample_job_post, salary_max=8000000, salary_min=7000000))
    is_valid_at, _ = job_filter.evaluate(job_at)
    assert is_valid_at is True

    # Undisclosed salary (None) -> Pass (don't blindly discard unlisted salaries)
    job_none = JobPost(**dict(sample_job_post, salary_min=None, salary_max=None))
    is_valid_none, _ = job_filter.evaluate(job_none)
    assert is_valid_none is True

def test_filter_experience_bva(job_filter, sample_job_post):
    """Boundary Value Analysis on Experience (max allowed = 5 years)."""
    # Exactly at boundary: 5 years -> Pass
    job_5yr = JobPost(**dict(sample_job_post, min_experience_years=5))
    is_valid_5, _ = job_filter.evaluate(job_5yr)
    assert is_valid_5 is True

    # Above boundary: 6 years -> Reject
    job_6yr = JobPost(**dict(sample_job_post, min_experience_years=6))
    is_valid_6, reason = job_filter.evaluate(job_6yr)
    assert is_valid_6 is False
    assert "Experience requirement (6) exceeds max (5)" in reason

def test_filter_location_matching(job_filter, sample_job_post):
    """Equivalence Partitioning: Accepted locations vs non-matching location."""
    # Yogyakarta -> Pass
    job_yk = JobPost(**dict(sample_job_post, location="Yogyakarta, Indonesia"))
    assert job_filter.evaluate(job_yk)[0] is True

    # Remote -> Pass
    job_rem = JobPost(**dict(sample_job_post, location="Fully Remote"))
    assert job_filter.evaluate(job_rem)[0] is True

    # Jakarta (not in Yogyakarta/Remote) -> Reject
    job_jkt = JobPost(**dict(sample_job_post, location="Jakarta Selatan"))
    is_valid, reason = job_filter.evaluate(job_jkt)
    assert is_valid is False
    assert "Location 'Jakarta Selatan' not in target locations" in reason

def test_filter_rejects_irrelevant_job_roles(job_filter, sample_job_post):
    """SRCH-REL-002: Filter must reject jobs with titles irrelevant to target_roles."""
    irrelevant_titles = [
        "Conservation Acquisition Representative",
        "Interior Project Manager",
        "Wakil Supervisor",
        "Freelance Recruiter",
        "Frontliner",
        "Account Manager IT"
    ]
    for title in irrelevant_titles:
        job = JobPost(**dict(sample_job_post, position=title))
        is_valid, reason = job_filter.evaluate(job)
        assert is_valid is False, f"Expected '{title}' to be rejected"
        assert "role" in reason.lower() or "target" in reason.lower() or "position" in reason.lower()

def test_filter_accepts_relevant_job_roles(job_filter, sample_job_post):
    """SRCH-REL-001: Filter must accept jobs with titles matching target_roles or related synonyms."""
    relevant_titles = [
        "QA Engineer",
        "Senior QA Automation Engineer",
        "Quality Assurance Specialist",
        "Software Tester",
        "SDET",
        "System Analyst"
    ]
    for title in relevant_titles:
        job = JobPost(**dict(sample_job_post, position=title))
        is_valid, reason = job_filter.evaluate(job)
        assert is_valid is True, f"Expected '{title}' to be accepted, but got: {reason}"

