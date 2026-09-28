import os
import json
import pytest
from pathlib import Path

@pytest.fixture
def sample_profile_data():
    return {
        "name": "Eka Pratama",
        "title": "QA Engineer",
        "location": "Yogyakarta",
        "email": "eka.qa@example.com",
        "phone": "+6281234567890",
        "linkedin": "https://linkedin.com/in/eka",
        "github": "https://github.com/eka",
        "summary": "QA Engineer with 4 years testing fintech and web applications.",
        "skills": {
            "Testing": ["Manual Testing", "API Testing", "Regression Testing"],
            "Automation": ["Playwright", "Postman"],
            "Database": ["SQL", "PostgreSQL"],
            "Development": ["Python", "JavaScript"]
        },
        "experiences": [
            {
                "company": "PT Solusi Digital",
                "role": "QA Engineer",
                "location": "Yogyakarta",
                "start_date": "2022-01",
                "end_date": "Present",
                "bullets": [
                    "Created 200+ test cases for payment API.",
                    "Automated regression suite using Playwright."
                ]
            }
        ],
        "educations": [
            {
                "degree": "Bachelor of Computer Science",
                "institution": "UGM",
                "graduation_year": "2020",
                "gpa": "3.72"
            }
        ],
        "certifications": [
            {
                "name": "ISTQB Certified Tester",
                "issuer": "ISTQB",
                "year": "2021"
            }
        ],
        "languages": [
            {"language": "Bahasa Indonesia", "proficiency": "Native"},
            {"language": "English", "proficiency": "Professional"}
        ],
        "screening_defaults": {
            "expected_salary": 9000000,
            "minimum_salary": 8000000,
            "notice_period_days": 30,
            "willing_to_relocate": False,
            "years_of_experience": 4
        }
    }

@pytest.fixture
def sample_preferences_data():
    return {
        "target_roles": ["QA Engineer", "System Analyst"],
        "target_locations": ["Yogyakarta", "Remote"],
        "minimum_salary": 8000000,
        "max_experience_requirement": 5,
        "exclude_keywords": ["Sales", "Marketing", "Commission Only"]
    }

@pytest.fixture
def sample_job_post():
    return {
        "source": "Glints",
        "company": "ABC Technology",
        "position": "QA Engineer",
        "location": "Remote",
        "salary_min": 10000000,
        "salary_max": 15000000,
        "job_url": "https://glints.com/id/opportunities/jobs/qa-engineer-123",
        "job_description": "We are looking for a QA Engineer proficient in Manual Testing, API Testing, SQL, and Playwright.",
        "requirements": ["API Testing", "SQL", "Playwright", "Manual Testing"],
        "min_experience_years": 3,
        "max_experience_years": 5
    }
