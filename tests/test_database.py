import pytest
import sqlite3
from datetime import datetime
from database.models import JobPost, ApplicationStatus
from database.db import DatabaseManager

@pytest.fixture
def in_memory_db():
    db = DatabaseManager(":memory:")
    db.init_db()
    yield db
    db.close()

def test_init_db_creates_tables(in_memory_db):
    """Test table creation and schema integrity."""
    cursor = in_memory_db.conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='jobs';")
    assert cursor.fetchone() is not None

def test_insert_and_get_job(in_memory_db, sample_job_post):
    """Happy path: inserting and retrieving a job."""
    job = JobPost(**sample_job_post)
    job_id = in_memory_db.insert_job(job)
    assert job_id is not None
    assert job_id > 0

    retrieved = in_memory_db.get_job_by_id(job_id)
    assert retrieved is not None
    assert retrieved.company == "ABC Technology"
    assert retrieved.position == "QA Engineer"
    assert retrieved.status == ApplicationStatus.NEW
    assert retrieved.salary_min == 10000000

def test_duplicate_protection(in_memory_db, sample_job_post):
    """Negative path: duplicate check on company + position + job_url."""
    job1 = JobPost(**sample_job_post)
    id1 = in_memory_db.insert_job(job1)
    assert id1 is not None

    # Check is_duplicate
    is_dup = in_memory_db.is_duplicate(job1.company, job1.position, job1.job_url)
    assert is_dup is True

    # Attempting to re-insert same job should return None or existing id without creating new record
    duplicate_result = in_memory_db.insert_job(job1)
    assert duplicate_result is None

    # Verify count is still 1
    cursor = in_memory_db.conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM jobs;")
    count = cursor.fetchone()[0]
    assert count == 1

def test_update_application_status(in_memory_db, sample_job_post):
    """State transition test: NEW -> READY_TO_APPLY -> APPLIED."""
    job = JobPost(**sample_job_post)
    job_id = in_memory_db.insert_job(job)

    # Transition to READY_TO_APPLY
    success = in_memory_db.update_status(job_id, ApplicationStatus.READY_TO_APPLY)
    assert success is True
    updated = in_memory_db.get_job_by_id(job_id)
    assert updated.status == ApplicationStatus.READY_TO_APPLY

    # Transition to APPLIED with cv_path and applied_at timestamp
    now = datetime.now().isoformat()
    success = in_memory_db.update_status(
        job_id,
        ApplicationStatus.APPLIED,
        cv_file="cv/generated/2026-09-28/Eka_QA_ABC.docx",
        applied_at=now
    )
    assert success is True
    updated2 = in_memory_db.get_job_by_id(job_id)
    assert updated2.status == ApplicationStatus.APPLIED
    assert updated2.cv_file == "cv/generated/2026-09-28/Eka_QA_ABC.docx"
    assert updated2.applied_at is not None

def test_invalid_status_raises_error(in_memory_db, sample_job_post):
    """Boundary / error case: invalid status string raises ValueError."""
    job = JobPost(**sample_job_post)
    job_id = in_memory_db.insert_job(job)
    with pytest.raises(ValueError):
        in_memory_db.update_status(job_id, "INVALID_STATUS_UNKNOWN")

def test_context_manager_and_stats(sample_job_post):
    """Verify context manager and stats aggregation."""
    with DatabaseManager(":memory:") as db:
        db.init_db()
        job = JobPost(**sample_job_post)
        db.insert_job(job)
        stats = db.get_stats()
        assert stats[ApplicationStatus.NEW.value] == 1
        assert stats[ApplicationStatus.APPLIED.value] == 0

def test_delete_single_job(in_memory_db, sample_job_post):
    """DEL-PY-001: Verify single job deletion from SQLite."""
    job = JobPost(**sample_job_post)
    job_id = in_memory_db.insert_job(job)
    assert job_id is not None

    # Deleting existing job
    success = in_memory_db.delete_job(job_id)
    assert success is True
    assert in_memory_db.get_job_by_id(job_id) is None

    # Deleting non-existent job
    assert in_memory_db.delete_job(99999) is False

def test_clear_all_jobs(in_memory_db, sample_job_post):
    """DEL-PY-002: Verify bulk deletion from SQLite."""
    job1 = JobPost(**sample_job_post)
    job2 = JobPost(**dict(sample_job_post, position="QA Lead", job_url="https://example.com/2"))
    in_memory_db.insert_job(job1)
    in_memory_db.insert_job(job2)

    deleted_count = in_memory_db.clear_all_jobs()
    assert deleted_count == 2

    # Should be empty
    stats = in_memory_db.get_stats()
    assert sum(stats.values()) == 0

