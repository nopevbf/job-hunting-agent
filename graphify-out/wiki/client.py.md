# client.py

> 21 nodes · cohesion 0.15

## Key Concepts

- **client.py** (11 connections) — `ai/client.py`
- **GeminiAIClient** (9 connections) — `ai/client.py`
- **test_ai_client.py** (9 connections) — `tests/test_ai_client.py`
- **JobExtractionSchema** (8 connections) — `ai/schemas.py`
- **.extract_job_details()** (5 connections) — `ai/client.py`
- **schemas.py** (5 connections) — `ai/schemas.py`
- **._fallback_extract()** (4 connections) — `ai/client.py`
- **test_offline_fallback_extraction()** (4 connections) — `tests/test_ai_client.py`
- **ai_client()** (3 connections) — `tests/test_ai_client.py`
- **unittest_mock** (3 connections)
- **.is_configured()** (2 connections) — `ai/client.py`
- **httpx** (2 connections)
- **test_gemini_api_success_extraction()** (2 connections) — `tests/test_ai_client.py`
- **.__init__()** (1 connections) — `ai/client.py`
- **Extract structured details from JD using Gemini API if configured, or…** (1 connections) — `ai/client.py`
- **Deterministic offline regex extractor.** (1 connections) — `ai/client.py`
- **prompts.py** (1 connections) — `ai/prompts.py`
- **BaseModel** (1 connections)
- **fixture** (1 connections)
- **Verify that when API key is missing or offline, client extracts fallback data…** (1 connections) — `tests/test_ai_client.py`
- **Test successful Gemini extraction with mock JSON response.** (1 connections) — `tests/test_ai_client.py`

## Relationships

- [models.py](models.py.md) (6 shared connections)
- [app.py](app.py.md) (3 shared connections)
- [JobMatcher](JobMatcher.md) (1 shared connections)
- [MicrosoftToDoSync](MicrosoftToDoSync.md) (1 shared connections)

## Source Files

- `ai/client.py`
- `ai/prompts.py`
- `ai/schemas.py`
- `tests/test_ai_client.py`

## Audit Trail

- EXTRACTED: 40 (93%)
- INFERRED: 3 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*