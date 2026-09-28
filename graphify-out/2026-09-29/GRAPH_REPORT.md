# Graph Report - Hunting Job  (2026-09-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 492 nodes · 1042 edges · 30 communities (23 shown, 7 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5dba0fb5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- package.json
- cv_builder.py
- JobFilter
- JobHuntingOrchestrator
- page.tsx
- DatabaseManager
- firestore.ts
- compilerOptions
- JobPost
- JobPostData
- GeminiAIClient
- FirestoreJobService
- job_matcher.py
- test_screening.py
- ApplicationStatus
- models.py
- KalibrrScraper
- decision_engine.ts
- ScreeningEvaluator
- next
- test_microsoft_todo.py
- stream/route.ts
- layout.tsx
- agent/__init__.py

## God Nodes (most connected - your core abstractions)
1. `JobPost` - 94 edges
2. `DatabaseManager` - 30 edges
3. `JobPostData` - 28 edges
4. `ApplicationStatus` - 25 edges
5. `JobHuntingOrchestrator` - 20 edges
6. `FirestoreJobService` - 18 edges
7. `MicrosoftToDoSync` - 17 edges
8. `compilerOptions` - 16 edges
9. `CVBuilder` - 15 edges
10. `JobFilter` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ApprovalConsole` --uses--> `JobPost`  [INFERRED]
  agent/approval.py → database/models.py
- `BaseJobScraper` --uses--> `JobPost`  [INFERRED]
  browser/base.py → database/models.py
- `GlintsScraper` --uses--> `JobPost`  [INFERRED]
  browser/glints.py → database/models.py
- `JobStreetScraper` --uses--> `JobPost`  [INFERRED]
  browser/jobstreet.py → database/models.py
- `JobHuntingOrchestrator` --uses--> `ApplicationStatus`  [INFERRED]
  agent/orchestrator.py → database/models.py

## Import Cycles
- None detected.

## Communities (30 total, 7 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.05
Nodes (45): ABC, ApprovalConsole, Any, Render Blueprint section 28 Daily Job Hunting Report table., cmd_pending(), cmd_report(), cmd_search(), get_orchestrator() (+37 more)

### Community 1 - "package.json"
Cohesion: 0.04
Nodes (43): autoprefixer, clsx, jsdom, postcss, react-dom, tailwind-merge, tailwindcss, @testing-library/jest-dom (+35 more)

### Community 2 - "cv_builder.py"
Cohesion: 0.08
Nodes (27): CVBuilder, Any, Enum, str, Generate ATS-friendly single column DOCX and save JD Snapshot JSON. Returns:…, Attempts to convert DOCX to PDF using LibreOffice or Word COM if available.…, Truth-Preserving CV Tailoring: - NEVER inject skills or experiences not present…, TailoringIntensity (+19 more)

### Community 3 - "JobFilter"
Cohesion: 0.08
Nodes (23): JobFilter, Any, Check if a job title is relevant to target roles or canonical synonyms., Determine if job location is acceptable. - If Indonesia-wide mode: accept all…, Evaluate if a job post meets filtering criteria. Returns: (is_valid: bool,…, job_filter(), fixture, Happy path: job meets all criteria. (+15 more)

### Community 4 - "JobHuntingOrchestrator"
Cohesion: 0.10
Nodes (13): JobMatcher, Any, Calculate weighted match score and gap analysis. Weights: - Skills: 35% -…, JobHuntingOrchestrator, End-to-End single job pipeline: 1. Duplicate Check 2. Filter Evaluation 3.…, User approves applying to job., MicrosoftToDoSync, matcher() (+5 more)

### Community 5 - "page.tsx"
Cohesion: 0.19
Nodes (17): lucide-react, react, DashboardPage(), HighMatchCard(), ProfilePillCard(), StatsCard(), StatsCardProps, DailyReportModal() (+9 more)

### Community 6 - "DatabaseManager"
Cohesion: 0.09
Nodes (11): DatabaseManager, Update application status and metadata., Delete a job by id. Returns True if deleted, False if not found., Initialize tables and indexes with duplicate protection., Delete all jobs from the database. Returns number of rows deleted., Get summary count of jobs by status., Check if job already exists by company + position + job_url., Insert new job post. Returns job id, or None if duplicate. (+3 more)

### Community 7 - "firestore.ts"
Cohesion: 0.14
Nodes (14): firebase, ref_fs, ref_path, vitest, fetchRealLiveJobs(), POST(), RawRealJob, ScoutRequest (+6 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "JobPost"
Cohesion: 0.12
Nodes (16): Formats textual representation of approval card as specified in Blueprint…, Render beautiful Rich terminal panel., JobPost, BaseModel, DEL-PY-002: Verify bulk deletion from SQLite., Negative path: duplicate check on company + position + job_url., Boundary / error case: invalid status string raises ValueError., DEL-PY-001: Verify single job deletion from SQLite. (+8 more)

### Community 10 - "JobPostData"
Cohesion: 0.19
Nodes (12): USER_PROFILE, HighMatchCardProps, CVPreviewModal(), CVPreviewModalProps, DeleteConfirmModalProps, JobCardProps, JobImportModalProps, ScreeningReviewModalProps (+4 more)

### Community 11 - "GeminiAIClient"
Cohesion: 0.18
Nodes (11): GeminiAIClient, Extract structured details from JD using Gemini API if configured, or…, Deterministic offline regex extractor., JobExtractionSchema, BaseModel, ai_client(), fixture, Verify that when API key is missing or offline, client extracts fallback data… (+3 more)

### Community 12 - "FirestoreJobService"
Cohesion: 0.18
Nodes (5): getFirestoreDb(), FirestoreJobService, seedMockStoreIfNeeded(), web_src_lib_synced_jobs, ApplicationStatus

### Community 13 - "job_matcher.py"
Cohesion: 0.24
Nodes (12): MatchClassification, MatchResult, BaseModel, Enum, str, pytest, Verify that approval console formats a detailed job review card., test_approval_card_formatting() (+4 more)

### Community 14 - "test_screening.py"
Cohesion: 0.18
Nodes (13): DecisionAction, Enum, str, Happy path: factual questions are resolved automatically from profile., Custom / unknown question cannot be guessed and must trigger NEED_REVIEW., ISTQB Decision Table Testing for Auto Apply: Rule 1 (All True): Score >= 85,…, BVA on auto apply threshold: 85.0 -> AUTO_APPLY, 84.9 -> WAITING_APPROVAL., Even if score is 95, custom question without answer forces NEED_REVIEW. (+5 more)

### Community 15 - "ApplicationStatus"
Cohesion: 0.14
Nodes (13): ApplicationStatus, Enum, str, Happy path: inserting and retrieving a job., State transition test: NEW -> READY_TO_APPLY -> APPLIED., Verify context manager and stats aggregation., test_context_manager_and_stats(), test_insert_and_get_job() (+5 more)

### Community 16 - "models.py"
Cohesion: 0.32
Nodes (6): datetime, pydantic, re, sqlite3, Test table creation and schema integrity., test_init_db_creates_tables()

### Community 17 - "KalibrrScraper"
Cohesion: 0.24
Nodes (6): KalibrrScraper, Any, Normalize raw Kalibrr JSON item into unified JobPost model., Scrape live jobs directly from Kalibrr Indonesia official REST API., SRCH-POR-001: Kalibrr raw JSON item properly normalized to JobPost., test_kalibrr_scraper_normalize_job()

### Community 18 - "decision_engine.ts"
Cohesion: 0.31
Nodes (7): ModeSelectorProps, AgentMode, CANDIDATE_DEFAULTS, evaluateModeDecision(), ModeDecision, resolveScreeningQuestion(), ScreeningResolution

### Community 19 - "ScreeningEvaluator"
Cohesion: 0.28
Nodes (6): Any, Resolve factual or saved screening questions without guessing. Returns the…, ISTQB Decision Table evaluation: - Check unresolved questions -> NEED_REVIEW -…, ScreeningEvaluator, evaluator(), fixture

### Community 21 - "test_microsoft_todo.py"
Cohesion: 0.25
Nodes (7): Verify task title and body match blueprint specifications., Test successful task creation through mocked HTTP requests., Unconfigured client credentials should not crash, but return None gracefully., test_format_task_title_and_body(), test_sync_job_task_success(), test_unconfigured_credentials_safe_fallback(), unittest_mock

### Community 22 - "stream/route.ts"
Cohesion: 0.29
Nodes (3): GET(), RawJob, ScoutLogEvent

### Community 23 - "layout.tsx"
Cohesion: 0.33
Nodes (4): web_src_app_globals, manrope, metadata, plusJakarta

## Knowledge Gaps
- **73 isolated node(s):** `ModeDecision`, `ScreeningResolution`, `RawJob`, `ScoutLogEvent`, `NavbarProps` (+68 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 212 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JobPost` connect `JobPost` to `app.py`, `cv_builder.py`, `JobFilter`, `JobHuntingOrchestrator`, `DatabaseManager`, `job_matcher.py`, `test_screening.py`, `ApplicationStatus`, `models.py`, `KalibrrScraper`, `ScreeningEvaluator`, `test_microsoft_todo.py`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `DatabaseManager` connect `DatabaseManager` to `app.py`, `cv_builder.py`, `JobHuntingOrchestrator`, `JobPost`, `ApplicationStatus`, `models.py`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `next` connect `next` to `package.json`, `firestore.ts`, `JobPostData`, `FirestoreJobService`, `stream/route.ts`, `layout.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `JobPost` (e.g. with `ApprovalConsole` and `CVBuilder`) actually correct?**
  _`JobPost` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `DatabaseManager` (e.g. with `JobHuntingOrchestrator` and `ApplicationStatus`) actually correct?**
  _`DatabaseManager` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `ApplicationStatus` (e.g. with `JobHuntingOrchestrator` and `cmd_pending()`) actually correct?**
  _`ApplicationStatus` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `JobHuntingOrchestrator` (e.g. with `CVBuilder` and `TailoringIntensity`) actually correct?**
  _`JobHuntingOrchestrator` has 12 INFERRED edges - model-reasoned connections that need verification._