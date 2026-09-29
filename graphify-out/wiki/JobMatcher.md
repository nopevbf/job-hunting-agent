# JobMatcher

> 16 nodes · cohesion 0.15

## Key Concepts

- **JobMatcher** (15 connections) — `agent/job_matcher.py`
- **pytest** (12 connections)
- **test_job_matcher.py** (11 connections) — `tests/test_job_matcher.py`
- **test_kalibrr.py** (6 connections) — `tests/test_kalibrr.py`
- **.calculate_match()** (5 connections) — `agent/job_matcher.py`
- **.classify_score()** (3 connections) — `agent/job_matcher.py`
- **.__init__()** (3 connections) — `agent/job_matcher.py`
- **matcher()** (3 connections) — `tests/test_job_matcher.py`
- **test_match_classification_thresholds_bva()** (3 connections) — `tests/test_job_matcher.py`
- **test_match_with_gaps()** (3 connections) — `tests/test_job_matcher.py`
- **._extract_all_user_skills()** (2 connections) — `agent/job_matcher.py`
- **Any** (1 connections)
- **Calculate weighted match score and gap analysis. Weights: - Skills: 35% -…** (1 connections) — `agent/job_matcher.py`
- **fixture** (1 connections)
- **Job with missing requirements (gaps detection).** (1 connections) — `tests/test_job_matcher.py`
- **BVA on Match Classification Thresholds.** (1 connections) — `tests/test_job_matcher.py`

## Relationships

- [models.py](models.py.md) (7 shared connections)
- [MatchResult](MatchResult.md) (7 shared connections)
- [app.py](app.py.md) (6 shared connections)
- [JobPost](JobPost.md) (6 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (3 shared connections)
- [cv_builder.py](cv_builder.py.md) (2 shared connections)
- [client.py](client.py.md) (1 shared connections)
- [test_job_filter.py](test_job_filter.py.md) (1 shared connections)
- [MicrosoftToDoSync](MicrosoftToDoSync.md) (1 shared connections)
- [test_screening.py](test_screening.py.md) (1 shared connections)

## Source Files

- `agent/job_matcher.py`
- `tests/test_job_matcher.py`
- `tests/test_kalibrr.py`

## Audit Trail

- EXTRACTED: 48 (91%)
- INFERRED: 5 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*