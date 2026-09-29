# Graph Report - Hunting Job  (2026-09-29)

## Corpus Check
- 79 files · ~26,796 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .example 2, (none) 2, .bak 1)

## Summary
- 513 nodes · 1070 edges · 26 communities (18 shown, 8 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5e49cf4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- page.tsx
- package.json
- cv_builder.py
- DatabaseManager
- MatchResult
- JobPost
- client.py
- models.py
- JobHuntingOrchestrator
- test_job_filter.py
- compilerOptions
- MicrosoftToDoSync
- 🎯 Job Hunting Agent — Personal AI Automation
- JobMatcher
- test_screening.py
- firestore.ts
- .evaluate
- agent/__init__.py
- graphify.md
- SKILL.md

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
- `orchestrator()` --uses--> `CVBuilder`  [INFERRED]
  tests/test_orchestrator.py → agent/cv_builder.py
- `JobFilter` --uses--> `JobPost`  [INFERRED]
  agent/job_filter.py → database/models.py

## Import Cycles
- None detected.

## Communities (26 total, 8 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.05
Nodes (45): ABC, cmd_pending(), cmd_report(), cmd_search(), get_orchestrator(), load_json_file(), main(), Review jobs waiting for user approval. (+37 more)

### Community 1 - "page.tsx"
Cohesion: 0.11
Nodes (35): lucide-react, react, DashboardPage(), HighMatchCard(), HighMatchCardProps, ProfilePillCard(), StatsCard(), StatsCardProps (+27 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (43): autoprefixer, clsx, jsdom, postcss, react-dom, tailwind-merge, tailwindcss, @testing-library/jest-dom (+35 more)

### Community 3 - "cv_builder.py"
Cohesion: 0.08
Nodes (25): CVBuilder, Any, Enum, str, Generate ATS-friendly single column DOCX and save JD Snapshot JSON. Returns:…, Attempts to convert DOCX to PDF using LibreOffice or Word COM if available.…, Truth-Preserving CV Tailoring: - NEVER inject skills or experiences not present…, TailoringIntensity (+17 more)

### Community 4 - "DatabaseManager"
Cohesion: 0.09
Nodes (11): DatabaseManager, Update application status and metadata., Delete a job by id. Returns True if deleted, False if not found., Initialize tables and indexes with duplicate protection., Delete all jobs from the database. Returns number of rows deleted., Get summary count of jobs by status., Check if job already exists by company + position + job_url., Insert new job post. Returns job id, or None if duplicate. (+3 more)

### Community 5 - "MatchResult"
Cohesion: 0.13
Nodes (17): ApprovalConsole, Any, Formats textual representation of approval card as specified in Blueprint…, Render beautiful Rich terminal panel., Render Blueprint section 28 Daily Job Hunting Report table., MatchClassification, MatchResult, BaseModel (+9 more)

### Community 6 - "JobPost"
Cohesion: 0.12
Nodes (21): JobPost, BaseModel, sqlite3, DEL-PY-002: Verify bulk deletion from SQLite., Test table creation and schema integrity., Happy path: inserting and retrieving a job., Negative path: duplicate check on company + position + job_url., State transition test: NEW -> READY_TO_APPLY -> APPLIED. (+13 more)

### Community 7 - "client.py"
Cohesion: 0.15
Nodes (13): GeminiAIClient, Extract structured details from JD using Gemini API if configured, or…, Deterministic offline regex extractor., JobExtractionSchema, BaseModel, httpx, ai_client(), fixture (+5 more)

### Community 8 - "models.py"
Cohesion: 0.27
Nodes (11): ApplicationStatus, Enum, str, datetime, pydantic, re, Scout mode processes job, calculates match, generates CV, but does not apply., User approval applies and updates status to APPLIED. (+3 more)

### Community 9 - "JobHuntingOrchestrator"
Cohesion: 0.14
Nodes (11): JobFilter, Any, JobHuntingOrchestrator, End-to-End single job pipeline: 1. Duplicate Check 2. Filter Evaluation 3.…, User approves applying to job., Any, Resolve factual or saved screening questions without guessing. Returns the…, ISTQB Decision Table evaluation: - Check unresolved questions -> NEED_REVIEW -… (+3 more)

### Community 10 - "test_job_filter.py"
Cohesion: 0.11
Nodes (18): job_filter(), fixture, Happy path: job meets all criteria., LOC-002: WFH dan Hybrid harus diterima sebagai lokasi valid., SRCH-REL-002: Filter must reject jobs with titles irrelevant to target_roles., SRCH-REL-001: Filter must accept jobs with titles matching target_roles or…, Equivalence Partitioning: Title or JD with excluded keyword is rejected., Boundary Value Analysis on Salary (min_salary = 8,000,000). (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "MicrosoftToDoSync"
Cohesion: 0.18
Nodes (9): MicrosoftToDoSync, fixture, Verify task title and body match blueprint specifications., Test successful task creation through mocked HTTP requests., Unconfigured client credentials should not crash, but return None gracefully., test_format_task_title_and_body(), test_sync_job_task_success(), test_unconfigured_credentials_safe_fallback() (+1 more)

### Community 13 - "🎯 Job Hunting Agent — Personal AI Automation"
Cohesion: 0.12
Nodes (16): 1. Menjalankan Pencarian Mode Scout (Tanpa Apply), 1. Prasyarat, 2. Menjalankan Pencarian Mode Assisted Apply (Default), 2. Setup Virtual Environment, 3. Konfigurasi Environment (`.env`), 3. Meninjau & Menyetujui Lowongan yang Menunggu Approval, 4. Melihat Laporan Harian (Daily Report), Deploy ke Vercel: (+8 more)

### Community 14 - "JobMatcher"
Cohesion: 0.15
Nodes (10): JobMatcher, Any, Calculate weighted match score and gap analysis. Weights: - Skills: 35% -…, pytest, matcher(), fixture, Job with missing requirements (gaps detection)., BVA on Match Classification Thresholds. (+2 more)

### Community 15 - "test_screening.py"
Cohesion: 0.15
Nodes (15): DecisionAction, Enum, str, evaluator(), fixture, Happy path: factual questions are resolved automatically from profile., Custom / unknown question cannot be guessed and must trigger NEED_REVIEW., ISTQB Decision Table Testing for Auto Apply: Rule 1 (All True): Score >= 85,… (+7 more)

### Community 16 - "firestore.ts"
Cohesion: 0.05
Nodes (29): firebase, ref_fs, next, ref_path, vitest, nextConfig, USER_PROFILE, fetchRealLiveJobs() (+21 more)

### Community 22 - ".evaluate"
Cohesion: 0.33
Nodes (3): Check if a job title is relevant to target roles or canonical synonyms., Determine if job location is acceptable. - If Indonesia-wide mode: accept all…, Evaluate if a job post meets filtering criteria. Returns: (is_valid: bool,…

## Knowledge Gaps
- **85 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 227 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JobPost` connect `JobPost` to `app.py`, `cv_builder.py`, `DatabaseManager`, `MatchResult`, `models.py`, `JobHuntingOrchestrator`, `test_job_filter.py`, `MicrosoftToDoSync`, `🎯 Job Hunting Agent — Personal AI Automation`, `JobMatcher`, `test_screening.py`, `.evaluate`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `DatabaseManager` connect `DatabaseManager` to `models.py`, `JobHuntingOrchestrator`, `app.py`, `JobPost`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `⚡ Fitur Utama` connect `🎯 Job Hunting Agent — Personal AI Automation` to `JobPost`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `JobPost` (e.g. with `ApprovalConsole` and `CVBuilder`) actually correct?**
  _`JobPost` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `DatabaseManager` (e.g. with `JobHuntingOrchestrator` and `ApplicationStatus`) actually correct?**
  _`DatabaseManager` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `ApplicationStatus` (e.g. with `JobHuntingOrchestrator` and `cmd_pending()`) actually correct?**
  _`ApplicationStatus` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `JobHuntingOrchestrator` (e.g. with `CVBuilder` and `TailoringIntensity`) actually correct?**
  _`JobHuntingOrchestrator` has 12 INFERRED edges - model-reasoned connections that need verification._