import os
import sys
import json
import logging
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.db import DatabaseManager
from database.models import JobPost

logger = logging.getLogger(__name__)

def sync_sqlite_to_firestore(db_path: str = "database/jobs.db") -> int:
    """
    Syncs jobs from local SQLite database into Firebase Firestore.
    Can be used by the local Python agent after running Playwright scrapers.
    """
    db = DatabaseManager(db_path)
    db.init_db()

    cursor = db.conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY id ASC")
    rows = cursor.fetchall()
    jobs = [db._row_to_model(r) for r in rows]

    print(f"Loaded {len(jobs)} jobs from SQLite.")

    # Check for Firebase credentials
    project_id = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID") or os.getenv("FIREBASE_PROJECT_ID")
    if not project_id:
        print("[INFO] FIREBASE_PROJECT_ID not set in environment. Storing exported JSON snapshot for web.")
        export_path = "web/src/lib/synced_jobs.json"
        with open(export_path, "w", encoding="utf-8") as f:
            json.dump([j.model_dump() for j in jobs], f, indent=2, ensure_ascii=False)
        print(f"[SUCCESS] Exported {len(jobs)} jobs to {export_path} for Web Dashboard.")
        return len(jobs)

    try:
        from google.cloud import firestore
        client = firestore.Client(project=project_id)
        collection_ref = client.collection("jobs")

        synced_count = 0
        for job in jobs:
            doc_id = f"job-{job.id}"
            data = job.model_dump()
            collection_ref.document(doc_id).set(data, merge=True)
            synced_count += 1

        print(f"[SUCCESS] Synced {synced_count} jobs directly to Google Cloud Firestore project '{project_id}'.")
        return synced_count
    except ImportError:
        print("[NOTICE] google-cloud-firestore not installed in Python venv. Using JSON sync bridge.")
        export_path = "web/src/lib/synced_jobs.json"
        with open(export_path, "w", encoding="utf-8") as f:
            json.dump([j.model_dump() for j in jobs], f, indent=2, ensure_ascii=False)
        return len(jobs)
    except Exception as e:
        print(f"[ERROR] Firestore sync error: {e}")
        return 0

if __name__ == "__main__":
    sync_sqlite_to_firestore()
