import re
import os
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from database.models import JobPost

logger = logging.getLogger(__name__)

class BaseJobScraper(ABC):
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.channel = os.getenv("BROWSER_CHANNEL", "chrome")
        self.headless = os.getenv("HEADLESS", "false").lower() == "true"

    def parse_salary(self, salary_str: Optional[str]) -> tuple[Optional[int], Optional[int]]:
        """
        Extract min and max salary in IDR numbers from text.
        e.g. 'IDR 12.000.000 - 18.000.000' -> (12000000, 18000000)
        """
        if not salary_str:
            return None, None

        # Clean string: remove dots in Indonesian numbers (e.g. 12.000.000 -> 12000000)
        text = salary_str.replace(".", "").replace(",", "")
        numbers = [int(n) for n in re.findall(r"\b\d{6,10}\b", text)]

        if len(numbers) >= 2:
            return min(numbers), max(numbers)
        elif len(numbers) == 1:
            return numbers[0], None
        return None, None

    def extract_experience(self, text: Optional[str]) -> Optional[int]:
        if not text:
            return None
        match = re.search(r"(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|thn|tahun)", text, re.IGNORECASE)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
        return None

    def extract_skills_from_text(self, text: str) -> List[str]:
        known = [
            "Manual Testing", "API Testing", "Playwright", "Selenium", "Postman",
            "SQL", "Python", "JavaScript", "Cypress", "JMeter", "Regression Testing"
        ]
        text_lower = text.lower()
        return [k for k in known if k.lower() in text_lower]

    @abstractmethod
    def normalize_job(self, raw_data: Dict[str, Any]) -> JobPost:
        pass
