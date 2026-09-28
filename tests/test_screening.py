import pytest
from database.models import JobPost, ApplicationStatus
from agent.screening import ScreeningEvaluator, DecisionAction

@pytest.fixture
def evaluator(sample_profile_data, sample_preferences_data):
    return ScreeningEvaluator(profile=sample_profile_data, preferences=sample_preferences_data)

def test_resolve_factual_questions(evaluator):
    """Happy path: factual questions are resolved automatically from profile."""
    assert evaluator.resolve_question("What is your full name?") == "Eka Pratama"
    assert evaluator.resolve_question("Email address?") == "eka.qa@example.com"
    assert evaluator.resolve_question("Phone number?") == "+6281234567890"
    assert evaluator.resolve_question("Current city / location?") == "Yogyakarta"
    assert evaluator.resolve_question("How many years of experience in QA do you have?") == 4
    assert evaluator.resolve_question("What is your expected salary?") == 9000000

def test_unresolved_question_triggers_need_review(evaluator):
    """Custom / unknown question cannot be guessed and must trigger NEED_REVIEW."""
    res = evaluator.resolve_question("Why do you want to work at our company?")
    assert res is None

def test_decision_table_auto_apply_vs_need_review(evaluator, sample_job_post):
    """
    ISTQB Decision Table Testing for Auto Apply:
    Rule 1 (All True): Score >= 85, Location in pref, Salary >= min, Category in pref, No custom question
    -> AUTO_APPLY
    """
    job_r1 = JobPost(**dict(
        sample_job_post,
        match_score=87.5,
        location="Remote",
        salary_min=10000000,
        position="QA Engineer"
    ))
    action, reason = evaluator.evaluate_application_action(
        job=job_r1,
        questions=[]
    )
    assert action == DecisionAction.AUTO_APPLY

def test_decision_table_score_bva(evaluator, sample_job_post):
    """BVA on auto apply threshold: 85.0 -> AUTO_APPLY, 84.9 -> WAITING_APPROVAL."""
    job_85 = JobPost(**dict(sample_job_post, match_score=85.0, location="Remote", salary_min=9000000))
    action_85, _ = evaluator.evaluate_application_action(job_85, questions=[])
    assert action_85 == DecisionAction.AUTO_APPLY

    job_84_9 = JobPost(**dict(sample_job_post, match_score=84.9, location="Remote", salary_min=9000000))
    action_84, _ = evaluator.evaluate_application_action(job_84_9, questions=[])
    assert action_84 == DecisionAction.WAITING_APPROVAL

def test_decision_table_custom_question_forces_need_review(evaluator, sample_job_post):
    """Even if score is 95, custom question without answer forces NEED_REVIEW."""
    job_high = JobPost(**dict(sample_job_post, match_score=95.0, location="Remote", salary_min=12000000))
    action, reason = evaluator.evaluate_application_action(
        job=job_high,
        questions=["Describe your experience with proprietary banking protocol ISO 8583?"]
    )
    assert action == DecisionAction.NEED_REVIEW
    assert "Unresolved screening questions" in reason
