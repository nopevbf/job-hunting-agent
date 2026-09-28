import sqlite3
import json
from typing import Optional, List
from datetime import datetime
from database.models import JobPost, ApplicationStatus

class DatabaseManager:
    def __init__(self, db_path: str = "database/jobs.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row

    def init_db(self):
        """Initialize tables and indexes with duplicate protection."""
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                company TEXT NOT NULL,
                position TEXT NOT NULL,
                location TEXT NOT NULL,
                salary_min INTEGER,
                salary_max INTEGER,
                job_url TEXT NOT NULL,
                job_description TEXT NOT NULL,
                requirements TEXT,
                min_experience_years INTEGER,
                max_experience_years INTEGER,
                match_score REAL,
                status TEXT NOT NULL,
                cv_file TEXT,
                cover_letter_file TEXT,
                snapshot_data TEXT,
                discovered_at TEXT NOT NULL,
                applied_at TEXT,
                updated_at TEXT NOT NULL,
                CONSTRAINT unique_job UNIQUE (company, position, job_url)
            );
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_jobs_lookup ON jobs(company, position, job_url);
        """)
        self.conn.commit()

    def is_duplicate(self, company: str, position: str, job_url: str) -> bool:
        """Check if job already exists by company + position + job_url."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id FROM jobs WHERE LOWER(company) = LOWER(?) AND LOWER(position) = LOWER(?) AND job_url = ?",
            (company.strip(), position.strip(), job_url.strip())
        )
        return cursor.fetchone() is not None

    def insert_job(self, job: JobPost) -> Optional[int]:
        """Insert new job post. Returns job id, or None if duplicate."""
        if self.is_duplicate(job.company, job.position, job.job_url):
            return None

        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO jobs (
                source, company, position, location, salary_min, salary_max,
                job_url, job_description, requirements, min_experience_years,
                max_experience_years, match_score, status, cv_file,
                cover_letter_file, snapshot_data, discovered_at, applied_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job.source,
            job.company.strip(),
            job.position.strip(),
            job.location,
            job.salary_min,
            job.salary_max,
            job.job_url.strip(),
            job.job_description,
            json.dumps(job.requirements),
            job.min_experience_years,
            job.max_experience_years,
            job.match_score,
            job.status.value,
            job.cv_file,
            job.cover_letter_file,
            job.snapshot_data,
            job.discovered_at or now,
            job.applied_at,
            now
        ))
        self.conn.commit()
        return cursor.lastrowid

    def get_job_by_id(self, job_id: int) -> Optional[JobPost]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return self._row_to_model(row)

    def update_status(
        self,
        job_id: int,
        status: ApplicationStatus,
        cv_file: Optional[str] = None,
        applied_at: Optional[str] = None,
        match_score: Optional[float] = None
    ) -> bool:
        """Update application status and metadata."""
        if isinstance(status, str):
            status = ApplicationStatus(status)

        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        updates = ["status = ?", "updated_at = ?"]
        params = [status.value, now]

        if cv_file is not None:
            updates.append("cv_file = ?")
            params.append(cv_file)
        if applied_at is not None:
            updates.append("applied_at = ?")
            params.append(applied_at)
        if match_score is not None:
            updates.append("match_score = ?")
            params.append(match_score)

        params.append(job_id)
        sql = f"UPDATE jobs SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(sql, tuple(params))
        self.conn.commit()
        return cursor.rowcount > 0

    def get_jobs_by_status(self, status: ApplicationStatus) -> List[JobPost]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM jobs WHERE status = ? ORDER BY id DESC", (status.value,))
        rows = cursor.fetchall()
        return [self._row_to_model(r) for r in rows]

    def _row_to_model(self, row: sqlite3.Row) -> JobPost:
        reqs = []
        if row["requirements"]:
            try:
                reqs = json.loads(row["requirements"])
            except Exception:
                reqs = []

        return JobPost(
            id=row["id"],
            source=row["source"],
            company=row["company"],
            position=row["position"],
            location=row["location"],
            salary_min=row["salary_min"],
            salary_max=row["salary_max"],
            job_url=row["job_url"],
            job_description=row["job_description"],
            requirements=reqs,
            min_experience_years=row["min_experience_years"],
            max_experience_years=row["max_experience_years"],
            match_score=row["match_score"],
            status=ApplicationStatus(row["status"]),
            cv_file=row["cv_file"],
            cover_letter_file=row["cover_letter_file"],
            snapshot_data=row["snapshot_data"],
            discovered_at=row["discovered_at"],
            applied_at=row["applied_at"],
            updated_at=row["updated_at"]
        )

    def get_stats(self) -> dict:
        """Get summary count of jobs by status."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT status, COUNT(*) as count FROM jobs GROUP BY status")
        rows = cursor.fetchall()
        stats = {status.value: 0 for status in ApplicationStatus}
        for r in rows:
            stats[r["status"]] = r["count"]
        return stats

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def close(self):
        if self.conn:
            self.conn.close()
