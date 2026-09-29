# JobHuntingOrchestrator

> 19 nodes · cohesion 0.14

## Key Concepts

- **JobHuntingOrchestrator** (20 connections) — `agent/orchestrator.py`
- **JobFilter** (15 connections) — `agent/job_filter.py`
- **ScreeningEvaluator** (14 connections) — `agent/screening.py`
- **orchestrator()** (8 connections) — `tests/test_orchestrator.py`
- **.__init__()** (7 connections) — `agent/orchestrator.py`
- **.evaluate_application_action()** (5 connections) — `agent/screening.py`
- **.resolve_question()** (4 connections) — `agent/screening.py`
- **.process_single_job()** (3 connections) — `agent/orchestrator.py`
- **.__init__()** (2 connections) — `agent/job_filter.py`
- **.apply_job()** (2 connections) — `agent/orchestrator.py`
- **Any** (2 connections)
- **.__init__()** (2 connections) — `agent/screening.py`
- **Any** (1 connections)
- **.skip_job()** (1 connections) — `agent/orchestrator.py`
- **End-to-End single job pipeline: 1. Duplicate Check 2. Filter Evaluation 3.…** (1 connections) — `agent/orchestrator.py`
- **User approves applying to job.** (1 connections) — `agent/orchestrator.py`
- **Resolve factual or saved screening questions without guessing. Returns the…** (1 connections) — `agent/screening.py`
- **ISTQB Decision Table evaluation: - Check unresolved questions -> NEED_REVIEW -…** (1 connections) — `agent/screening.py`
- **fixture** (1 connections)

## Relationships

- [models.py](models.py.md) (10 shared connections)
- [app.py](app.py.md) (6 shared connections)
- [JobPost](JobPost.md) (5 shared connections)
- [cv_builder.py](cv_builder.py.md) (4 shared connections)
- [test_screening.py](test_screening.py.md) (4 shared connections)
- [.evaluate](evaluate.md) (3 shared connections)
- [DatabaseManager](DatabaseManager.md) (3 shared connections)
- [JobMatcher](JobMatcher.md) (3 shared connections)
- [test_job_filter.py](test_job_filter.py.md) (2 shared connections)
- [MicrosoftToDoSync](MicrosoftToDoSync.md) (2 shared connections)
- [MatchResult](MatchResult.md) (1 shared connections)

## Source Files

- `agent/job_filter.py`
- `agent/orchestrator.py`
- `agent/screening.py`
- `tests/test_orchestrator.py`

## Audit Trail

- EXTRACTED: 46 (69%)
- INFERRED: 21 (31%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*