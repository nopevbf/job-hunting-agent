# test_screening.py

> 16 nodes · cohesion 0.15

## Key Concepts

- **test_screening.py** (13 connections) — `tests/test_screening.py`
- **DecisionAction** (11 connections) — `agent/screening.py`
- **test_decision_table_auto_apply_vs_need_review()** (4 connections) — `tests/test_screening.py`
- **test_decision_table_custom_question_forces_need_review()** (4 connections) — `tests/test_screening.py`
- **test_decision_table_score_bva()** (4 connections) — `tests/test_screening.py`
- **evaluator()** (3 connections) — `tests/test_screening.py`
- **Enum** (2 connections)
- **test_resolve_factual_questions()** (2 connections) — `tests/test_screening.py`
- **test_unresolved_question_triggers_need_review()** (2 connections) — `tests/test_screening.py`
- **str** (1 connections)
- **fixture** (1 connections)
- **Happy path: factual questions are resolved automatically from profile.** (1 connections) — `tests/test_screening.py`
- **Custom / unknown question cannot be guessed and must trigger NEED_REVIEW.** (1 connections) — `tests/test_screening.py`
- **ISTQB Decision Table Testing for Auto Apply: Rule 1 (All True): Score >= 85,…** (1 connections) — `tests/test_screening.py`
- **BVA on auto apply threshold: 85.0 -> AUTO_APPLY, 84.9 -> WAITING_APPROVAL.** (1 connections) — `tests/test_screening.py`
- **Even if score is 95, custom question without answer forces NEED_REVIEW.** (1 connections) — `tests/test_screening.py`

## Relationships

- [models.py](models.py.md) (7 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (4 shared connections)
- [JobPost](JobPost.md) (4 shared connections)
- [JobMatcher](JobMatcher.md) (1 shared connections)

## Source Files

- `agent/screening.py`
- `tests/test_screening.py`

## Audit Trail

- EXTRACTED: 29 (85%)
- INFERRED: 5 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*