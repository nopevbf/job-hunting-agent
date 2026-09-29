# Graph Report - Hunting Job  (2026-09-29)

## Corpus Check
- 84 files · ~28,272 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .example 2, (none) 2, .bak 1)

## Summary
- 545 nodes · 1128 edges · 38 communities (23 shown, 15 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4d2bf7b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaseJobScraper
- page.tsx
- package.json
- test_generate_docx_file_structure
- DatabaseManager
- .format_card
- app.py
- GeminiAIClient
- models.py
- JobMatcher
- test_job_filter.py
- compilerOptions
- MicrosoftToDoSync
- 🎯 Job Hunting Agent — Personal AI Automation
- ScreeningEvaluator
- JobPost
- firestore.ts
- app
- CVBuilder
- LinkedInScraper
- JobFilter
- handler
- GlintsScraper
- JobStreetScraper
- test_orchestrator.py
- agent/__init__.py
- graphify.md
- SKILL.md
- .render_daily_report
- test_microsoft_todo.py
- test_duplicate_protection
- test_invalid_status_raises_error
- test_decision_table_score_bva

## God Nodes (most connected - your core abstractions)
1. `JobPost` - 101 edges
2. `DatabaseManager` - 30 edges
3. `JobPostData` - 30 edges
4. `ApplicationStatus` - 27 edges
5. `JobHuntingOrchestrator` - 20 edges
6. `firestoreJobService` - 19 edges
7. `MicrosoftToDoSync` - 17 edges
8. `compilerOptions` - 16 edges
9. `CVBuilder` - 15 edges
10. `JobFilter` - 15 edges

## Surprising Connections (you probably didn't know these)
- `⚡ Fitur Utama` --references--> `JobPost`  [INFERRED]
  README.md → database/models.py
- `ApprovalConsole` --uses--> `JobPost`  [INFERRED]
  agent/approval.py → database/models.py
- `CVBuilder` --uses--> `JobPost`  [INFERRED]
  agent/cv_builder.py → database/models.py
- `orchestrator()` --uses--> `CVBuilder`  [INFERRED]
  tests/test_orchestrator.py → agent/cv_builder.py
- `JobFilter` --uses--> `JobPost`  [INFERRED]
  agent/job_filter.py → database/models.py

## Import Cycles
- None detected.

## Communities (38 total, 15 thin omitted)

### Community 0 - "BaseJobScraper"
Cohesion: 0.12
Nodes (10): ABC, BaseJobScraper, Any, Extract min and max salary in IDR numbers from text. e.g. 'IDR 12.000.000 -…, KalibrrScraper, Any, Normalize raw Kalibrr JSON item into unified JobPost model., Scrape live jobs directly from Kalibrr Indonesia official REST API. (+2 more)

### Community 1 - "page.tsx"
Cohesion: 0.11
Nodes (34): lucide-react, react, DashboardPage(), HighMatchCard(), HighMatchCardProps, ProfilePillCard(), StatsCard(), StatsCardProps (+26 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (43): autoprefixer, clsx, jsdom, postcss, react-dom, tailwind-merge, tailwindcss, @testing-library/jest-dom (+35 more)

### Community 4 - "DatabaseManager"
Cohesion: 0.09
Nodes (11): DatabaseManager, Update application status and metadata., Delete a job by id. Returns True if deleted, False if not found., Initialize tables and indexes with duplicate protection., Delete all jobs from the database. Returns number of rows deleted., Get summary count of jobs by status., Check if job already exists by company + position + job_url., Insert new job post. Returns job id, or None if duplicate. (+3 more)

### Community 6 - "app.py"
Cohesion: 0.18
Nodes (14): ApprovalConsole, cmd_pending(), cmd_report(), cmd_search(), main(), Review jobs waiting for user approval., argparse, Console (+6 more)

### Community 7 - "GeminiAIClient"
Cohesion: 0.18
Nodes (12): GeminiAIClient, Extract structured details from JD using Gemini API if configured, or…, Deterministic offline regex extractor., JobExtractionSchema, BaseModel, ai_client(), fixture, Verify that when API key is missing or offline, client extracts fallback data… (+4 more)

### Community 8 - "models.py"
Cohesion: 0.06
Nodes (55): Enum, str, TailoringIntensity, MatchClassification, MatchResult, BaseModel, Enum, str (+47 more)

### Community 9 - "JobMatcher"
Cohesion: 0.22
Nodes (7): JobMatcher, Any, Calculate weighted match score and gap analysis. Weights: - Skills: 35% -…, get_orchestrator(), load_json_file(), matcher(), fixture

### Community 10 - "test_job_filter.py"
Cohesion: 0.11
Nodes (18): job_filter(), fixture, Happy path: job meets all criteria., LOC-002: WFH dan Hybrid harus diterima sebagai lokasi valid., SRCH-REL-002: Filter must reject jobs with titles irrelevant to target_roles., SRCH-REL-001: Filter must accept jobs with titles matching target_roles or…, Equivalence Partitioning: Title or JD with excluded keyword is rejected., Boundary Value Analysis on Salary (min_salary = 8,000,000). (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "🎯 Job Hunting Agent — Personal AI Automation"
Cohesion: 0.12
Nodes (16): 1. Menjalankan Pencarian Mode Scout (Tanpa Apply), 1. Prasyarat, 2. Menjalankan Pencarian Mode Assisted Apply (Default), 2. Setup Virtual Environment, 3. Konfigurasi Environment (`.env`), 3. Meninjau & Menyetujui Lowongan yang Menunggu Approval, 4. Melihat Laporan Harian (Daily Report), Deploy ke Vercel: (+8 more)

### Community 14 - "ScreeningEvaluator"
Cohesion: 0.28
Nodes (6): Any, Resolve factual or saved screening questions without guessing. Returns the…, ISTQB Decision Table evaluation: - Check unresolved questions -> NEED_REVIEW -…, ScreeningEvaluator, evaluator(), fixture

### Community 15 - "JobPost"
Cohesion: 0.10
Nodes (19): End-to-End single job pipeline: 1. Duplicate Check 2. Filter Evaluation 3.…, JobPost, BaseModel, DEL-PY-002: Verify bulk deletion from SQLite., DEL-PY-001: Verify single job deletion from SQLite., test_clear_all_jobs(), test_delete_single_job(), Job with missing requirements (gaps detection). (+11 more)

### Community 16 - "firestore.ts"
Cohesion: 0.05
Nodes (29): firebase, ref_fs, next, ref_path, vitest, nextConfig, USER_PROFILE, fetchRealLiveJobs() (+21 more)

### Community 17 - "app"
Cohesion: 0.17
Nodes (11): entrypoint, root, runtime, rewrites, $schema, services, app, web (+3 more)

### Community 18 - "CVBuilder"
Cohesion: 0.18
Nodes (8): CVBuilder, Any, Generate ATS-friendly single column DOCX and save JD Snapshot JSON. Returns:…, Attempts to convert DOCX to PDF using LibreOffice or Word COM if available.…, Truth-Preserving CV Tailoring: - NEVER inject skills or experiences not present…, Path, cv_builder(), fixture

### Community 19 - "LinkedInScraper"
Cohesion: 0.23
Nodes (8): LinkedInScraper, Fetch and parse live jobs from LinkedIn guest API., Scraper for LinkedIn job postings using public guest API endpoints. Does not…, Parse HTML cards returned by LinkedIn guest API into JobPost models., object, test_linkedin_scraper_empty_html_bva(), test_linkedin_scraper_network_timeout_fallback(), test_linkedin_scraper_parse_jobs()

### Community 20 - "JobFilter"
Cohesion: 0.24
Nodes (5): JobFilter, Any, Check if a job title is relevant to target roles or canonical synonyms., Determine if job location is acceptable. - If Indonesia-wide mode: accept all…, Evaluate if a job post meets filtering criteria. Returns: (is_valid: bool,…

### Community 21 - "handler"
Cohesion: 0.33
Nodes (3): handler, BaseHTTPRequestHandler, http_server

### Community 22 - "GlintsScraper"
Cohesion: 0.25
Nodes (6): GlintsScraper, Any, Normalize raw Glints job card into unified JobPost model., Scrape live jobs directly from Glints Indonesia using Playwright Chrome., Verify parsing and normalization of Glints raw job card data., test_glints_scraper_parse_card()

### Community 23 - "JobStreetScraper"
Cohesion: 0.18
Nodes (10): JobStreetScraper, Any, Normalize raw JobStreet job card into unified JobPost model., Scrape live jobs directly from JobStreet Indonesia using Playwright Chrome., Verify parsing and normalization of JobStreet raw job card data., Ensure both scrapers implement the real scrape() method., Verify that app.py does not contain hardcoded dummy sample feeds., test_app_does_not_contain_hardcoded_sample_feeds() (+2 more)

### Community 24 - "test_orchestrator.py"
Cohesion: 0.24
Nodes (7): JobHuntingOrchestrator, User approves applying to job., DecisionAction, Enum, str, orchestrator(), fixture

### Community 34 - "test_microsoft_todo.py"
Cohesion: 0.22
Nodes (8): fixture, Verify task title and body match blueprint specifications., Test successful task creation through mocked HTTP requests., Unconfigured client credentials should not crash, but return None gracefully., test_format_task_title_and_body(), test_sync_job_task_success(), test_unconfigured_credentials_safe_fallback(), todo_sync()

## Knowledge Gaps
- **93 isolated node(s):** `$schema`, `root`, `framework`, `bindings`, `root` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 246 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JobPost` connect `JobPost` to `BaseJobScraper`, `test_generate_docx_file_structure`, `DatabaseManager`, `.format_card`, `app.py`, `models.py`, `JobMatcher`, `test_job_filter.py`, `MicrosoftToDoSync`, `🎯 Job Hunting Agent — Personal AI Automation`, `ScreeningEvaluator`, `CVBuilder`, `LinkedInScraper`, `JobFilter`, `GlintsScraper`, `JobStreetScraper`, `test_orchestrator.py`, `.render_daily_report`, `test_microsoft_todo.py`, `test_duplicate_protection`, `test_invalid_status_raises_error`, `test_decision_table_score_bva`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `DatabaseManager` connect `DatabaseManager` to `app.py`, `models.py`, `JobMatcher`, `JobPost`, `JobFilter`, `test_orchestrator.py`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `⚡ Fitur Utama` connect `🎯 Job Hunting Agent — Personal AI Automation` to `JobPost`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `JobPost` (e.g. with `ApprovalConsole` and `CVBuilder`) actually correct?**
  _`JobPost` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `DatabaseManager` (e.g. with `JobHuntingOrchestrator` and `ApplicationStatus`) actually correct?**
  _`DatabaseManager` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `ApplicationStatus` (e.g. with `JobHuntingOrchestrator` and `cmd_pending()`) actually correct?**
  _`ApplicationStatus` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `JobHuntingOrchestrator` (e.g. with `CVBuilder` and `TailoringIntensity`) actually correct?**
  _`JobHuntingOrchestrator` has 12 INFERRED edges - model-reasoned connections that need verification._