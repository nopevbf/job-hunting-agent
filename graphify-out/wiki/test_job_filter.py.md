# test_job_filter.py

> 19 nodes · cohesion 0.11

## Key Concepts

- **test_job_filter.py** (14 connections) — `tests/test_job_filter.py`
- **job_filter()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_accepts_relevant_job_roles()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_experience_bva()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_location_matching()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_location_wfh_hybrid()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_pass_valid_job()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_rejects_excluded_keywords()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_rejects_irrelevant_job_roles()** (3 connections) — `tests/test_job_filter.py`
- **test_filter_salary_bva()** (3 connections) — `tests/test_job_filter.py`
- **fixture** (1 connections)
- **Happy path: job meets all criteria.** (1 connections) — `tests/test_job_filter.py`
- **LOC-002: WFH dan Hybrid harus diterima sebagai lokasi valid.** (1 connections) — `tests/test_job_filter.py`
- **SRCH-REL-002: Filter must reject jobs with titles irrelevant to target_roles.** (1 connections) — `tests/test_job_filter.py`
- **SRCH-REL-001: Filter must accept jobs with titles matching target_roles or…** (1 connections) — `tests/test_job_filter.py`
- **Equivalence Partitioning: Title or JD with excluded keyword is rejected.** (1 connections) — `tests/test_job_filter.py`
- **Boundary Value Analysis on Salary (min_salary = 8,000,000).** (1 connections) — `tests/test_job_filter.py`
- **Boundary Value Analysis on Experience (max allowed = 5 years).** (1 connections) — `tests/test_job_filter.py`
- **Equivalence Partitioning: Accepted locations vs non-matching location. LOC-001:…** (1 connections) — `tests/test_job_filter.py`

## Relationships

- [JobPost](JobPost.md) (9 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (2 shared connections)
- [models.py](models.py.md) (2 shared connections)
- [JobMatcher](JobMatcher.md) (1 shared connections)

## Source Files

- `tests/test_job_filter.py`

## Audit Trail

- EXTRACTED: 31 (97%)
- INFERRED: 1 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*