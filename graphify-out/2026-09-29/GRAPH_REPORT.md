# Graph Report - Hunting Job  (2026-09-29)

## Corpus Check
- 81 files · ~26,725 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .example 2, (none) 2, .bak 1)

## Summary
- 530 nodes · 1084 edges · 36 communities (25 shown, 11 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3c82786`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaseJobScraper
- page.tsx
- package.json
- cv_builder.py
- DatabaseManager
- job_matcher.py
- app.py
- client.py
- models.py
- test_orchestrator.py
- test_job_filter.py
- compilerOptions
- MicrosoftToDoSync
- 🎯 Job Hunting Agent — Personal AI Automation
- .evaluate_application_action
- JobPost
- stream/route.ts
- app
- .build_tailored_content
- KalibrrScraper
- .evaluate
- handler
- .normalize_job
- .normalize_job
- conftest.py
- agent/__init__.py
- graphify.md
- SKILL.md
- .render_daily_report
- matcher
- evaluator

## God Nodes (most connected - your core abstractions)
1. `JobPost` - 95 edges
2. `DatabaseManager` - 30 edges
3. `JobPostData` - 30 edges
4. `ApplicationStatus` - 25 edges
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
- `cv_builder()` --uses--> `CVBuilder`  [INFERRED]
  tests/test_cv_builder.py → agent/cv_builder.py
- `JobFilter` --uses--> `JobPost`  [INFERRED]
  agent/job_filter.py → database/models.py

## Import Cycles
- None detected.

## Communities (36 total, 11 thin omitted)

### Community 0 - "BaseJobScraper"
Cohesion: 0.11
Nodes (17): ABC, BaseJobScraper, Any, Extract min and max salary in IDR numbers from text. e.g. 'IDR 12.000.000 -…, GlintsScraper, JobStreetScraper, logging, Verify parsing and normalization of JobStreet raw job card data. (+9 more)

### Community 1 - "page.tsx"
Cohesion: 0.06
Nodes (44): firebase, lucide-react, react, vitest, USER_PROFILE, DashboardPage(), HighMatchCard(), HighMatchCardProps (+36 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (43): autoprefixer, clsx, jsdom, postcss, react-dom, tailwind-merge, tailwindcss, @testing-library/jest-dom (+35 more)

### Community 3 - "cv_builder.py"
Cohesion: 0.14
Nodes (18): Enum, str, TailoringIntensity, docx, docx_enum_text, docx_shared, json, os (+10 more)

### Community 4 - "DatabaseManager"
Cohesion: 0.09
Nodes (11): DatabaseManager, Update application status and metadata., Delete a job by id. Returns True if deleted, False if not found., Initialize tables and indexes with duplicate protection., Delete all jobs from the database. Returns number of rows deleted., Get summary count of jobs by status., Check if job already exists by company + position + job_url., Insert new job post. Returns job id, or None if duplicate. (+3 more)

### Community 5 - "job_matcher.py"
Cohesion: 0.12
Nodes (21): ApprovalConsole, Formats textual representation of approval card as specified in Blueprint…, Render beautiful Rich terminal panel., MatchClassification, MatchResult, BaseModel, Enum, str (+13 more)

### Community 6 - "app.py"
Cohesion: 0.22
Nodes (12): cmd_pending(), cmd_report(), cmd_search(), load_json_file(), main(), Review jobs waiting for user approval., argparse, Syncs jobs from local SQLite database into Firebase Firestore. Can be used by… (+4 more)

### Community 7 - "client.py"
Cohesion: 0.15
Nodes (13): GeminiAIClient, Extract structured details from JD using Gemini API if configured, or…, Deterministic offline regex extractor., JobExtractionSchema, BaseModel, httpx, ai_client(), fixture (+5 more)

### Community 8 - "models.py"
Cohesion: 0.15
Nodes (19): ApplicationStatus, Enum, str, datetime, pytest, sqlite3, Test table creation and schema integrity., Happy path: inserting and retrieving a job. (+11 more)

### Community 9 - "test_orchestrator.py"
Cohesion: 0.14
Nodes (15): CVBuilder, JobFilter, Any, JobMatcher, Any, Calculate weighted match score and gap analysis. Weights: - Skills: 35% -…, JobHuntingOrchestrator, End-to-End single job pipeline: 1. Duplicate Check 2. Filter Evaluation 3.… (+7 more)

### Community 10 - "test_job_filter.py"
Cohesion: 0.11
Nodes (18): job_filter(), fixture, Happy path: job meets all criteria., LOC-002: WFH dan Hybrid harus diterima sebagai lokasi valid., SRCH-REL-002: Filter must reject jobs with titles irrelevant to target_roles., SRCH-REL-001: Filter must accept jobs with titles matching target_roles or…, Equivalence Partitioning: Title or JD with excluded keyword is rejected., Boundary Value Analysis on Salary (min_salary = 8,000,000). (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "MicrosoftToDoSync"
Cohesion: 0.33
Nodes (3): MicrosoftToDoSync, fixture, todo_sync()

### Community 13 - "🎯 Job Hunting Agent — Personal AI Automation"
Cohesion: 0.12
Nodes (16): 1. Menjalankan Pencarian Mode Scout (Tanpa Apply), 1. Prasyarat, 2. Menjalankan Pencarian Mode Assisted Apply (Default), 2. Setup Virtual Environment, 3. Konfigurasi Environment (`.env`), 3. Meninjau & Menyetujui Lowongan yang Menunggu Approval, 4. Melihat Laporan Harian (Daily Report), Deploy ke Vercel: (+8 more)

### Community 14 - ".evaluate_application_action"
Cohesion: 0.33
Nodes (3): Any, Resolve factual or saved screening questions without guessing. Returns the…, ISTQB Decision Table evaluation: - Check unresolved questions -> NEED_REVIEW -…

### Community 15 - "JobPost"
Cohesion: 0.08
Nodes (29): DecisionAction, Enum, str, JobPost, BaseModel, DEL-PY-002: Verify bulk deletion from SQLite., Negative path: duplicate check on company + position + job_url., Boundary / error case: invalid status string raises ValueError. (+21 more)

### Community 16 - "stream/route.ts"
Cohesion: 0.07
Nodes (19): ref_fs, next, ref_path, nextConfig, fetchRealLiveJobs(), POST(), RawRealJob, ScoutRequest (+11 more)

### Community 17 - "app"
Cohesion: 0.17
Nodes (11): entrypoint, root, runtime, rewrites, $schema, services, app, web (+3 more)

### Community 18 - ".build_tailored_content"
Cohesion: 0.18
Nodes (5): Any, Generate ATS-friendly single column DOCX and save JD Snapshot JSON. Returns:…, Attempts to convert DOCX to PDF using LibreOffice or Word COM if available.…, Truth-Preserving CV Tailoring: - NEVER inject skills or experiences not present…, Path

### Community 19 - "KalibrrScraper"
Cohesion: 0.25
Nodes (6): KalibrrScraper, Any, Normalize raw Kalibrr JSON item into unified JobPost model., Scrape live jobs directly from Kalibrr Indonesia official REST API., SRCH-POR-001: Kalibrr raw JSON item properly normalized to JobPost., test_kalibrr_scraper_normalize_job()

### Community 20 - ".evaluate"
Cohesion: 0.33
Nodes (3): Check if a job title is relevant to target roles or canonical synonyms., Determine if job location is acceptable. - If Indonesia-wide mode: accept all…, Evaluate if a job post meets filtering criteria. Returns: (is_valid: bool,…

### Community 21 - "handler"
Cohesion: 0.33
Nodes (3): handler, BaseHTTPRequestHandler, http_server

### Community 22 - ".normalize_job"
Cohesion: 0.40
Nodes (3): Any, Normalize raw Glints job card into unified JobPost model., Scrape live jobs directly from Glints Indonesia using Playwright Chrome.

### Community 23 - ".normalize_job"
Cohesion: 0.40
Nodes (3): Any, Normalize raw JobStreet job card into unified JobPost model., Scrape live jobs directly from JobStreet Indonesia using Playwright Chrome.

### Community 24 - "conftest.py"
Cohesion: 0.60
Nodes (4): fixture, sample_job_post(), sample_preferences_data(), sample_profile_data()

## Knowledge Gaps
- **93 isolated node(s):** `$schema`, `root`, `framework`, `bindings`, `root` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 240 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JobPost` connect `JobPost` to `BaseJobScraper`, `.render_daily_report`, `cv_builder.py`, `DatabaseManager`, `job_matcher.py`, `app.py`, `models.py`, `test_orchestrator.py`, `test_job_filter.py`, `MicrosoftToDoSync`, `🎯 Job Hunting Agent — Personal AI Automation`, `.evaluate_application_action`, `.build_tailored_content`, `KalibrrScraper`, `.evaluate`, `.normalize_job`, `.normalize_job`?**
  _High betweenness centrality (0.232) - this node is a cross-community bridge._
- **Why does `DatabaseManager` connect `DatabaseManager` to `cv_builder.py`, `app.py`, `models.py`, `test_orchestrator.py`, `JobPost`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `⚡ Fitur Utama` connect `🎯 Job Hunting Agent — Personal AI Automation` to `JobPost`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `JobPost` (e.g. with `ApprovalConsole` and `CVBuilder`) actually correct?**
  _`JobPost` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `DatabaseManager` (e.g. with `JobHuntingOrchestrator` and `ApplicationStatus`) actually correct?**
  _`DatabaseManager` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `ApplicationStatus` (e.g. with `JobHuntingOrchestrator` and `cmd_pending()`) actually correct?**
  _`ApplicationStatus` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `JobHuntingOrchestrator` (e.g. with `CVBuilder` and `TailoringIntensity`) actually correct?**
  _`JobHuntingOrchestrator` has 12 INFERRED edges - model-reasoned connections that need verification._