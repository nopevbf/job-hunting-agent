import pytest
from unittest.mock import patch, MagicMock
from database.models import JobPost, ApplicationStatus
from integrations.microsoft_todo import MicrosoftToDoSync

@pytest.fixture
def todo_sync():
    return MicrosoftToDoSync(
        client_id="mock-client-id",
        tenant_id="mock-tenant-id",
        client_secret="mock-client-secret",
        list_name="Job Applications"
    )

def test_format_task_title_and_body(todo_sync, sample_job_post):
    """Verify task title and body match blueprint specifications."""
    job = JobPost(**dict(
        sample_job_post,
        status=ApplicationStatus.APPLIED,
        applied_at="2026-09-28T09:00:00",
        cv_file="cv/generated/2026-09-28/Eka_QA_ABC.docx"
    ))

    title = todo_sync.format_title(job)
    assert title == "[Applied] QA Engineer - ABC Technology"

    body = todo_sync.format_body(job)
    assert "Company:\nABC Technology" in body
    assert "Position:\nQA Engineer" in body
    assert "Source:\nGlints" in body
    assert "Location:\nRemote" in body
    assert "Status:\nAPPLIED" in body
    assert "CV:\ncv/generated/2026-09-28/Eka_QA_ABC.docx" in body
    assert "Job URL:\nhttps://glints.com/id/opportunities/jobs/qa-engineer-123" in body

def test_sync_job_task_success(todo_sync, sample_job_post):
    """Test successful task creation through mocked HTTP requests."""
    job = JobPost(**dict(sample_job_post, status=ApplicationStatus.APPLIED))

    with patch.object(todo_sync, "_get_access_token", return_value="mock-token"):
        with patch.object(todo_sync, "_get_or_create_list_id", return_value="list-123"):
            with patch("httpx.post") as mock_post:
                mock_response = MagicMock()
                mock_response.status_code = 201
                mock_response.json.return_value = {"id": "task-abc", "title": "[Applied] QA Engineer - ABC Technology"}
                mock_post.return_value = mock_response

                task_id = todo_sync.create_or_update_task(job)
                assert task_id == "task-abc"
                mock_post.assert_called_once()

def test_unconfigured_credentials_safe_fallback():
    """Unconfigured client credentials should not crash, but return None gracefully."""
    empty_sync = MicrosoftToDoSync(client_id="", tenant_id="", client_secret="")
    job = JobPost(
        source="Glints",
        company="ABC",
        position="QA",
        location="Remote",
        job_url="https://example.com",
        job_description="QA testing description"
    )
    result = empty_sync.create_or_update_task(job)
    assert result is None
