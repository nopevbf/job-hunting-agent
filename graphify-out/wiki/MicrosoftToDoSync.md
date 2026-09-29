# MicrosoftToDoSync

> 17 nodes · cohesion 0.18

## Key Concepts

- **MicrosoftToDoSync** (17 connections) — `integrations/microsoft_todo.py`
- **test_microsoft_todo.py** (11 connections) — `tests/test_microsoft_todo.py`
- **.create_or_update_task()** (7 connections) — `integrations/microsoft_todo.py`
- **test_format_task_title_and_body()** (4 connections) — `tests/test_microsoft_todo.py`
- **test_sync_job_task_success()** (4 connections) — `tests/test_microsoft_todo.py`
- **test_unconfigured_credentials_safe_fallback()** (4 connections) — `tests/test_microsoft_todo.py`
- **.format_body()** (3 connections) — `integrations/microsoft_todo.py`
- **.format_title()** (3 connections) — `integrations/microsoft_todo.py`
- **._get_access_token()** (3 connections) — `integrations/microsoft_todo.py`
- **.is_configured()** (3 connections) — `integrations/microsoft_todo.py`
- **todo_sync()** (3 connections) — `tests/test_microsoft_todo.py`
- **._get_or_create_list_id()** (2 connections) — `integrations/microsoft_todo.py`
- **.__init__()** (1 connections) — `integrations/microsoft_todo.py`
- **fixture** (1 connections)
- **Verify task title and body match blueprint specifications.** (1 connections) — `tests/test_microsoft_todo.py`
- **Test successful task creation through mocked HTTP requests.** (1 connections) — `tests/test_microsoft_todo.py`
- **Unconfigured client credentials should not crash, but return None gracefully.** (1 connections) — `tests/test_microsoft_todo.py`

## Relationships

- [JobPost](JobPost.md) (8 shared connections)
- [models.py](models.py.md) (7 shared connections)
- [app.py](app.py.md) (2 shared connections)
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) (2 shared connections)
- [JobMatcher](JobMatcher.md) (1 shared connections)
- [client.py](client.py.md) (1 shared connections)

## Source Files

- `integrations/microsoft_todo.py`
- `tests/test_microsoft_todo.py`

## Audit Trail

- EXTRACTED: 40 (89%)
- INFERRED: 5 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*