# JobPost

> 22 nodes · cohesion 0.12

## Key Concepts

- **JobPost** (95 connections) — `database/models.py`
- **test_database.py** (17 connections) — `tests/test_database.py`
- **test_context_manager_and_stats()** (5 connections) — `tests/test_database.py`
- **test_insert_and_get_job()** (4 connections) — `tests/test_database.py`
- **test_update_application_status()** (4 connections) — `tests/test_database.py`
- **test_clear_all_jobs()** (3 connections) — `tests/test_database.py`
- **test_delete_single_job()** (3 connections) — `tests/test_database.py`
- **test_duplicate_protection()** (3 connections) — `tests/test_database.py`
- **test_invalid_status_raises_error()** (3 connections) — `tests/test_database.py`
- **test_orchestrator_suppresses_duplicate()** (3 connections) — `tests/test_orchestrator.py`
- **sqlite3** (2 connections)
- **test_init_db_creates_tables()** (2 connections) — `tests/test_database.py`
- **BaseModel** (1 connections)
- **DEL-PY-002: Verify bulk deletion from SQLite.** (1 connections) — `tests/test_database.py`
- **Test table creation and schema integrity.** (1 connections) — `tests/test_database.py`
- **Happy path: inserting and retrieving a job.** (1 connections) — `tests/test_database.py`
- **Negative path: duplicate check on company + position + job_url.** (1 connections) — `tests/test_database.py`
- **State transition test: NEW -> READY_TO_APPLY -> APPLIED.** (1 connections) — `tests/test_database.py`
- **Boundary / error case: invalid status string raises ValueError.** (1 connections) — `tests/test_database.py`
- **Verify context manager and stats aggregation.** (1 connections) — `tests/test_database.py`
- **DEL-PY-001: Verify single job deletion from SQLite.** (1 connections) — `tests/test_database.py`
- **Duplicate job should be skipped and return None.** (1 connections) — `tests/test_orchestrator.py`

## Relationships

- [app.py](app.py.md) (21 shared connections)
- [models.py](models.py.md) (19 shared connections)
- [test_job_filter.py](test_job_filter.py.md) (9 shared connections)
- [MatchResult](MatchResult.md) (8 shared connections)
- [cv_builder.py](cv_builder.py.md) (8 shared connections)
- [MicrosoftToDoSync](MicrosoftToDoSync.md) (8 shared connections)
- [DatabaseManager](DatabaseManager.md) (8 shared connections)
- [JobMatcher](JobMatcher.md) (6 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (5 shared connections)
- [test_screening.py](test_screening.py.md) (4 shared connections)
- [.evaluate](evaluate.md) (1 shared connections)
- [🎯 Job Hunting Agent — Personal AI Automation](🎯_Job_Hunting_Agent_—_Personal_AI_Automation.md) (1 shared connections)

## Source Files

- `database/models.py`
- `tests/test_database.py`
- `tests/test_orchestrator.py`

## Audit Trail

- EXTRACTED: 107 (85%)
- INFERRED: 19 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*