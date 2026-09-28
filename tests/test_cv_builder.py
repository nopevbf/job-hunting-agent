import os
import json
import pytest
from pathlib import Path
from docx import Document
from database.models import JobPost
from agent.job_matcher import MatchResult, MatchClassification
from agent.cv_builder import CVBuilder, TailoringIntensity

@pytest.fixture
def cv_builder(sample_profile_data, tmp_path):
    output_dir = tmp_path / "cv_output"
    output_dir.mkdir()
    return CVBuilder(profile=sample_profile_data, base_output_dir=str(output_dir))

def test_truth_preserving_zero_hallucination(cv_builder, sample_job_post):
    """
    CRITICAL SQA / CV Rule:
    Ensure that requirements in JD NOT in Master Profile (e.g. Cypress, Docker)
    are NEVER injected into the generated resume skills.
    """
    job_dict = dict(sample_job_post)
    job_dict["requirements"] = ["API Testing", "Playwright", "Cypress", "Docker", "Kubernetes"]
    job = JobPost(**job_dict)

    tailored = cv_builder.build_tailored_content(
        job=job,
        intensity=TailoringIntensity.MEDIUM
    )

    # All generated skills must come exclusively from user profile
    flat_tailored_skills = []
    for cat, skills in tailored["skills"].items():
        flat_tailored_skills.extend([s.lower() for s in skills])

    # Assert that missing skills are NOT injected
    assert "cypress" not in flat_tailored_skills
    assert "docker" not in flat_tailored_skills
    assert "kubernetes" not in flat_tailored_skills

    # Assert that matched skills ARE present
    assert "api testing" in flat_tailored_skills
    assert "playwright" in flat_tailored_skills

    # Assert gaps are captured in metadata
    assert "Cypress" in tailored["gaps"]
    assert "Docker" in tailored["gaps"]

def test_skills_reordered_by_jd_relevance(cv_builder, sample_job_post):
    """
    Verify that skills prioritized in JD appear first in the tailored resume.
    """
    job_dict = dict(sample_job_post)
    job_dict["requirements"] = ["Playwright", "SQL"]
    job = JobPost(**job_dict)

    tailored = cv_builder.build_tailored_content(
        job=job,
        intensity=TailoringIntensity.MEDIUM
    )

    # Testing or Automation skills related to Playwright & SQL should be at the top
    top_category = list(tailored["skills"].keys())[0]
    first_skills = tailored["skills"][top_category]
    assert any("playwright" in s.lower() or "sql" in s.lower() or "testing" in s.lower() for s in first_skills)

def test_generate_docx_file_structure(cv_builder, sample_job_post):
    """
    Verify ATS-friendly single column DOCX file generation.
    """
    job = JobPost(**sample_job_post)
    tailored = cv_builder.build_tailored_content(job=job)
    docx_path, snapshot_path = cv_builder.generate_documents(job=job, tailored_content=tailored)

    assert os.path.exists(docx_path)
    assert docx_path.endswith(".docx")
    assert os.path.exists(snapshot_path)
    assert snapshot_path.endswith(".json")

    # Read back generated DOCX to ensure it has headings and content
    doc = Document(docx_path)
    paragraphs_text = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = " ".join(paragraphs_text)

    # Name and Title should be in document
    assert "Eka Pratama" in full_text
    assert "QA Engineer" in full_text
    assert "professional experience" in full_text.lower()
    assert "technical skills" in full_text.lower()


    # Snapshot JSON validation
    with open(snapshot_path, "r", encoding="utf-8") as f:
        snap = json.load(f)
        assert snap["company"] == job.company
        assert snap["position"] == job.position
        assert "tailored_content" in snap
