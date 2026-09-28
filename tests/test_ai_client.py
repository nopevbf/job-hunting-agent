import pytest
from unittest.mock import patch, MagicMock
from ai.client import GeminiAIClient
from ai.schemas import JobExtractionSchema

@pytest.fixture
def ai_client():
    return GeminiAIClient(api_key="mock-gemini-key", model="gemini-3.8-flash")

def test_offline_fallback_extraction():
    """Verify that when API key is missing or offline, client extracts fallback data without error."""
    offline_client = GeminiAIClient(api_key="", model="gemini-3.8-flash")
    raw_jd = """
    We are looking for a QA Engineer with 3+ years of experience.
    Must have experience in API Testing, SQL, Postman, and Playwright.
    Nice to have: Docker, CI/CD.
    Salary up to Rp15.000.000.
    """
    result: JobExtractionSchema = offline_client.extract_job_details(raw_jd)
    assert isinstance(result, JobExtractionSchema)
    assert any("api testing" in r.lower() or "sql" in r.lower() for r in result.requirements)
    assert result.min_experience_years is not None

def test_gemini_api_success_extraction(ai_client):
    """Test successful Gemini extraction with mock JSON response."""
    raw_jd = "Senior QA Automation Engineer, 5 years exp, Playwright, Python."
    mock_json_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": '{"position": "Senior QA Automation Engineer", "requirements": ["Playwright", "Python", "Automation"], "min_experience_years": 5, "domain": "Software"}'
                        }
                    ]
                }
            }
        ]
    }

    with patch("httpx.post") as mock_post:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_json_response
        mock_post.return_value = mock_resp

        result = ai_client.extract_job_details(raw_jd)
        assert result.position == "Senior QA Automation Engineer"
        assert "Playwright" in result.requirements
        assert result.min_experience_years == 5
