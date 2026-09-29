# models.py

> 19 nodes · cohesion 0.27

## Key Concepts

- **models.py** (30 connections) — `database/models.py`
- **ApplicationStatus** (25 connections) — `database/models.py`
- **orchestrator.py** (24 connections) — `agent/orchestrator.py`
- **test_orchestrator.py** (22 connections) — `tests/test_orchestrator.py`
- **job_matcher.py** (16 connections) — `agent/job_matcher.py`
- **typing** (15 connections)
- **db.py** (13 connections) — `database/db.py`
- **screening.py** (11 connections) — `agent/screening.py`
- **microsoft_todo.py** (11 connections) — `integrations/microsoft_todo.py`
- **job_filter.py** (9 connections) — `agent/job_filter.py`
- **datetime** (6 connections)
- **re** (6 connections)
- **test_orchestrator_approval_action()** (4 connections) — `tests/test_orchestrator.py`
- **test_orchestrator_process_job_scout_mode()** (4 connections) — `tests/test_orchestrator.py`
- **pydantic** (3 connections)
- **Enum** (2 connections)
- **str** (1 connections)
- **Scout mode processes job, calculates match, generates CV, but does not apply.** (1 connections) — `tests/test_orchestrator.py`
- **User approval applies and updates status to APPLIED.** (1 connections) — `tests/test_orchestrator.py`

## Relationships

- [app.py](app.py.md) (26 shared connections)
- [JobPost](JobPost.md) (19 shared connections)
- [MatchResult](MatchResult.md) (11 shared connections)
- [cv_builder.py](cv_builder.py.md) (11 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (10 shared connections)
- [JobMatcher](JobMatcher.md) (7 shared connections)
- [MicrosoftToDoSync](MicrosoftToDoSync.md) (7 shared connections)
- [test_screening.py](test_screening.py.md) (7 shared connections)
- [DatabaseManager](DatabaseManager.md) (6 shared connections)
- [client.py](client.py.md) (6 shared connections)
- [test_job_filter.py](test_job_filter.py.md) (2 shared connections)

## Source Files

- `agent/job_filter.py`
- `agent/job_matcher.py`
- `agent/orchestrator.py`
- `agent/screening.py`
- `database/db.py`
- `database/models.py`
- `integrations/microsoft_todo.py`
- `tests/test_orchestrator.py`

## Audit Trail

- EXTRACTED: 147 (93%)
- INFERRED: 11 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*