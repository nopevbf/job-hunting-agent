import pytest
from database.models import JobPost
from agent.job_matcher import JobMatcher, MatchResult, MatchClassification

@pytest.fixture
def matcher(sample_profile_data):
    return JobMatcher(profile=sample_profile_data)

def test_match_high_score(matcher, sample_job_post):
    """Happy path: Strong match job."""
    job = JobPost(**sample_job_post)
    result: MatchResult = matcher.calculate_match(job)

    assert result.total_score >= 80
    assert result.classification in [MatchClassification.STRONG_MATCH, MatchClassification.EXCELLENT_MATCH]
    assert "Playwright" in result.matched_skills
    assert "API Testing" in result.matched_skills
    assert "SQL" in result.matched_skills
    assert len(result.gaps) == 0

def test_match_with_gaps(matcher, sample_job_post):
    """Job with missing requirements (gaps detection)."""
    job_dict = dict(sample_job_post)
    job_dict["requirements"] = ["API Testing", "SQL", "Cypress", "Performance Testing (JMeter)"]
    job = JobPost(**job_dict)

    result = matcher.calculate_match(job)
    assert "Cypress" in result.gaps
    assert "Performance Testing (JMeter)" in result.gaps
    assert "API Testing" in result.matched_skills
    # Gaps should lower the total score
    assert result.total_score < 90

def test_match_classification_thresholds_bva(matcher, sample_job_post):
    """BVA on Match Classification Thresholds."""
    assert matcher.classify_score(90.0) == MatchClassification.EXCELLENT_MATCH
    assert matcher.classify_score(89.9) == MatchClassification.STRONG_MATCH
    assert matcher.classify_score(80.0) == MatchClassification.STRONG_MATCH
    assert matcher.classify_score(79.9) == MatchClassification.GOOD_MATCH
    assert matcher.classify_score(70.0) == MatchClassification.GOOD_MATCH
    assert matcher.classify_score(69.9) == MatchClassification.REVIEW
    assert matcher.classify_score(60.0) == MatchClassification.REVIEW
    assert matcher.classify_score(59.9) == MatchClassification.LOW_MATCH
