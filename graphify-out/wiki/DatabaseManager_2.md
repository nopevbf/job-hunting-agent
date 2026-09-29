# DatabaseManager

> God node · 30 connections · `database/db.py`

**Community:** [DatabaseManager](DatabaseManager.md)

## Connections by Relation

### calls
- get_orchestrator() `EXTRACTED`
- sync_sqlite_to_firestore() `EXTRACTED`
- test_context_manager_and_stats() `EXTRACTED`
- cmd_report() `EXTRACTED`

### contains
- db.py `EXTRACTED`

### imports
- [app.py](app.py.md) `EXTRACTED`
- orchestrator.py `EXTRACTED`
- test_orchestrator.py `EXTRACTED`
- test_database.py `EXTRACTED`
- firestore_sync.py `EXTRACTED`

### method
- ._row_to_model() `EXTRACTED`
- .get_jobs_by_status() `EXTRACTED`
- .insert_job() `EXTRACTED`
- .update_status() `EXTRACTED`
- .is_duplicate() `EXTRACTED`
- .get_job_by_id() `EXTRACTED`
- .init_db() `EXTRACTED`
- .delete_job() `EXTRACTED`
- .clear_all_jobs() `EXTRACTED`
- .get_stats() `EXTRACTED`
- .__exit__() `EXTRACTED`
- .close() `EXTRACTED`
- .__enter__() `EXTRACTED`
- .__init__() `EXTRACTED`

### references
- .__init__() `EXTRACTED`

### uses
- [JobPost](JobPost.md) `INFERRED`
- [ApplicationStatus](ApplicationStatus.md) `INFERRED`
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) `INFERRED`
- orchestrator() `INFERRED`
- in_memory_db() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*