import os
import re
import json
import logging
from typing import Optional, List
import httpx
from ai.schemas import JobExtractionSchema
from ai.prompts import JOB_EXTRACTION_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class GeminiAIClient:
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def extract_job_details(self, raw_jd: str) -> JobExtractionSchema:
        """
        Extract structured details from JD using Gemini API if configured,
        or deterministic regex fallback if offline / key not present.
        """
        if not self.is_configured():
            return self._fallback_extract(raw_jd)

        url = f"{self.GEMINI_API_URL.format(model=self.model)}?key={self.api_key}"
        prompt = f"{JOB_EXTRACTION_SYSTEM_PROMPT}\n\nJob Description:\n{raw_jd}"

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        try:
            resp = httpx.post(url, json=payload, timeout=20.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return JobExtractionSchema(**parsed)
            logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")

        # Fallback if API call failed
        return self._fallback_extract(raw_jd)

    def _fallback_extract(self, raw_jd: str) -> JobExtractionSchema:
        """
        Deterministic offline regex extractor.
        """
        jd_lower = raw_jd.lower()

        # Common QA skills & tools detection
        known_skills = [
            "api testing", "manual testing", "regression testing", "automation testing",
            "playwright", "cypress", "selenium", "postman", "sql", "postgresql",
            "mysql", "python", "javascript", "ci/cd", "docker", "jmeter", "k6",
            "jira", "git", "performance testing", "security testing"
        ]
        found_reqs = [s.title() for s in known_skills if s in jd_lower]

        # Experience extraction (e.g. 3+ years, 2-4 tahun)
        min_exp = None
        exp_match = re.search(r"(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|thn|tahun)", jd_lower)
        if exp_match:
            try:
                min_exp = int(exp_match.group(1))
            except ValueError:
                pass

        # Title extraction heuristic
        position = None
        for title in ["qa engineer", "quality assurance", "qa automation", "system analyst", "software engineer"]:
            if title in jd_lower:
                position = title.title()
                break

        return JobExtractionSchema(
            position=position or "QA Engineer",
            requirements=found_reqs,
            min_experience_years=min_exp or 2,
            tools=[s for s in found_reqs if s.lower() in ["playwright", "postman", "sql", "jira", "git"]]
        )
