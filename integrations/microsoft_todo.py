import os
import logging
from typing import Optional
import httpx
from database.models import JobPost, ApplicationStatus

logger = logging.getLogger(__name__)

class MicrosoftToDoSync:
    GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"
    TOKEN_ENDPOINT = "https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

    def __init__(
        self,
        client_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        list_name: str = "Job Applications"
    ):
        self.client_id = client_id or os.getenv("MICROSOFT_CLIENT_ID", "")
        self.tenant_id = tenant_id or os.getenv("MICROSOFT_TENANT_ID", "")
        self.client_secret = client_secret or os.getenv("MICROSOFT_CLIENT_SECRET", "")
        self.list_name = list_name or os.getenv("MICROSOFT_TODO_LIST_NAME", "Job Applications")
        self._list_id: Optional[str] = None

    def is_configured(self) -> bool:
        return bool(self.client_id and self.tenant_id and self.client_secret)

    def format_title(self, job: JobPost) -> str:
        status_tag = job.status.value.capitalize() if job.status else "New"
        return f"[{status_tag}] {job.position} - {job.company}"

    def format_body(self, job: JobPost) -> str:
        salary_str = "Undisclosed"
        if job.salary_min and job.salary_max:
            salary_str = f"Rp{job.salary_min:,} - Rp{job.salary_max:,}"
        elif job.salary_min:
            salary_str = f"Min Rp{job.salary_min:,}"
        elif job.salary_max:
            salary_str = f"Max Rp{job.salary_max:,}"

        return (
            f"Company:\n{job.company}\n\n"
            f"Position:\n{job.position}\n\n"
            f"Source:\n{job.source}\n\n"
            f"Location:\n{job.location}\n\n"
            f"Salary:\n{salary_str}\n\n"
            f"Applied:\n{job.applied_at or 'N/A'}\n\n"
            f"CV:\n{job.cv_file or 'N/A'}\n\n"
            f"Job URL:\n{job.job_url}\n\n"
            f"Status:\n{job.status.value}"
        )

    def _get_access_token(self) -> Optional[str]:
        if not self.is_configured():
            return None
        url = self.TOKEN_ENDPOINT.format(tenant_id=self.tenant_id)
        data = {
            "client_id": self.client_id,
            "scope": "https://graph.microsoft.com/.default",
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        try:
            resp = httpx.post(url, data=data, timeout=10.0)
            if resp.status_code == 200:
                return resp.json().get("access_token")
            logger.warning(f"Failed to fetch Graph API token: {resp.text}")
        except Exception as e:
            logger.error(f"Error fetching Graph token: {e}")
        return None

    def _get_or_create_list_id(self, token: str) -> Optional[str]:
        if self._list_id:
            return self._list_id

        headers = {"Authorization": f"Bearer {token}"}
        url = f"{self.GRAPH_API_BASE}/me/todo/lists"
        try:
            resp = httpx.get(url, headers=headers, timeout=10.0)
            if resp.status_code == 200:
                lists = resp.json().get("value", [])
                for l in lists:
                    if l.get("displayName", "").lower() == self.list_name.lower():
                        self._list_id = l.get("id")
                        return self._list_id

            # Create if not exists
            create_resp = httpx.post(url, headers=headers, json={"displayName": self.list_name}, timeout=10.0)
            if create_resp.status_code in [200, 201]:
                self._list_id = create_resp.json().get("id")
                return self._list_id
        except Exception as e:
            logger.error(f"Error resolving To Do list: {e}")
        return None

    def create_or_update_task(self, job: JobPost) -> Optional[str]:
        if not self.is_configured():
            logger.info("Microsoft To Do credentials not configured; skipping sync.")
            return None

        token = self._get_access_token()
        if not token:
            return None

        list_id = self._get_or_create_list_id(token)
        if not list_id:
            return None

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        task_payload = {
            "title": self.format_title(job),
            "body": {
                "contentType": "text",
                "content": self.format_body(job)
            }
        }
        try:
            url = f"{self.GRAPH_API_BASE}/me/todo/lists/{list_id}/tasks"
            resp = httpx.post(url, headers=headers, json=task_payload, timeout=10.0)
            if resp.status_code in [200, 201]:
                data = resp.json()
                return data.get("id")
            logger.warning(f"Graph API task creation returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Error creating Microsoft To Do task: {e}")
        return None
