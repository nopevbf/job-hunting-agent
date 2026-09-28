import pytest
from unittest.mock import patch, MagicMock
from database.models import JobPost, ApplicationStatus
from database.db import DatabaseManager
from agent.job_filter import JobFilter
from agent.job_matcher import JobMatcher
from agent.cv_builder import CVBuilder
from agent.screening import ScreeningEvaluator, DecisionAction
from agent.orchestrator import JobHuntingOrchestrator

@pytest.fixture
def orchestrator(tmp_path, sample_profile_data, sample_preferences_data):
    db_file = tmp_path / "test_jobs.db"
    db = DatabaseManager(str(db_file))
    db.init_db()

    cv_dir = tmp_path / "cv_output"
    cv_dir.mkdir()

    job_filter = JobFilter(sample_preferences_data)
    job_matcher = JobMatcher(sample_profile_data)
    cv_builder = CVBuilder(sample_profile_data, base_output_dir=str(cv_dir))
    screening = ScreeningEvaluator(sample_profile_data, sample_preferences_data)

    orch = JobHuntingOrchestrator(
        db=db,
        job_filter=job_filter,
        job_matcher=job_matcher,
        cv_builder=cv_builder,
        screening_evaluator=screening,
        mode="SCOUT"
    )
    return orch

def test_orchestrator_process_job_scout_mode(orchestrator, sample_job_post):
    """Scout mode processes job, calculates match, generates CV, but does not apply."""
    raw_job = JobPost(**sample_job_post)
    processed = orchestrator.process_single_job(raw_job)

    assert processed is not None
    assert processed.status in [ApplicationStatus.REVIEW, ApplicationStatus.READY_TO_APPLY]
    assert processed.match_score >= 80.0
    assert processed.cv_file is not None
    assert processed.applied_at is None

    # Check that it was saved to DB
    saved = orchestrator.db.get_job_by_id(processed.id)
    assert saved is not None
    assert saved.company == "ABC Technology"

def test_orchestrator_suppresses_duplicate(orchestrator, sample_job_post):
    """Duplicate job should be skipped and return None."""
    raw_job = JobPost(**sample_job_post)
    res1 = orchestrator.process_single_job(raw_job)
    assert res1 is not None

    # Process exact same job again
    res2 = orchestrator.process_single_job(raw_job)
    assert res2 is None

def test_orchestrator_approval_action(orchestrator, sample_job_post):
    """User approval applies and updates status to APPLIED."""
    raw_job = JobPost(**sample_job_post)
    processed = orchestrator.process_single_job(raw_job)

    success = orchestrator.apply_job(processed.id)
    assert success is True

    updated = orchestrator.db.get_job_by_id(processed.id)
    assert updated.status == ApplicationStatus.APPLIED
    assert updated.applied_at is not None
