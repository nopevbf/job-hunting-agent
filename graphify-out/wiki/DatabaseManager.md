# DatabaseManager

> 25 nodes · cohesion 0.09

## Key Concepts

- **DatabaseManager** (30 connections) — `database/db.py`
- **._row_to_model()** (5 connections) — `database/db.py`
- **.get_jobs_by_status()** (4 connections) — `database/db.py`
- **.insert_job()** (4 connections) — `database/db.py`
- **.get_job_by_id()** (3 connections) — `database/db.py`
- **.is_duplicate()** (3 connections) — `database/db.py`
- **.update_status()** (3 connections) — `database/db.py`
- **in_memory_db()** (3 connections) — `tests/test_database.py`
- **.clear_all_jobs()** (2 connections) — `database/db.py`
- **.close()** (2 connections) — `database/db.py`
- **.delete_job()** (2 connections) — `database/db.py`
- **.__exit__()** (2 connections) — `database/db.py`
- **.get_stats()** (2 connections) — `database/db.py`
- **.init_db()** (2 connections) — `database/db.py`
- **.__enter__()** (1 connections) — `database/db.py`
- **.__init__()** (1 connections) — `database/db.py`
- **Update application status and metadata.** (1 connections) — `database/db.py`
- **Delete a job by id. Returns True if deleted, False if not found.** (1 connections) — `database/db.py`
- **Initialize tables and indexes with duplicate protection.** (1 connections) — `database/db.py`
- **Delete all jobs from the database. Returns number of rows deleted.** (1 connections) — `database/db.py`
- **Get summary count of jobs by status.** (1 connections) — `database/db.py`
- **Check if job already exists by company + position + job_url.** (1 connections) — `database/db.py`
- **Insert new job post. Returns job id, or None if duplicate.** (1 connections) — `database/db.py`
- **Row** (1 connections)
- **fixture** (1 connections)

## Relationships

- [JobPost](JobPost.md) (8 shared connections)
- [models.py](models.py.md) (6 shared connections)
- [app.py](app.py.md) (5 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (3 shared connections)

## Source Files

- `database/db.py`
- `tests/test_database.py`

## Audit Trail

- EXTRACTED: 45 (90%)
- INFERRED: 5 (10%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*