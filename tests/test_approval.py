import pytest
from database.models import JobPost, ApplicationStatus
from agent.job_matcher import MatchResult, MatchClassification
from agent.approval import ApprovalConsole

def test_approval_card_formatting(sample_job_post):
    """Verify that approval console formats a detailed job review card."""
    console = ApprovalConsole()
    job = JobPost(**dict(
        sample_job_post,
        id=1,
        match_score=91.0,
        status=ApplicationStatus.READY_TO_APPLY,
        cv_file="cv/generated/2026-09-28/Eka_QA_ABC.docx"
    ))
    match_result = MatchResult(
        total_score=91.0,
        classification=MatchClassification.EXCELLENT_MATCH,
        matched_skills=["API Testing", "SQL", "Playwright"],
        gaps=["Cypress"]
    )

    card_str = console.format_card(job, match_result)
    assert "ABC Technology" in card_str
    assert "QA Engineer" in card_str
    assert "91.0%" in card_str
    assert "API Testing" in card_str
    assert "Cypress" in card_str
    assert "cv/generated/2026-09-28/Eka_QA_ABC.docx" in card_str
