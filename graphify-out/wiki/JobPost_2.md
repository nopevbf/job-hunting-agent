# JobPost

> God node · 95 connections · `database/models.py`

**Community:** [JobPost](JobPost.md)

## Connections by Relation

### calls
- test_approval_card_formatting() `EXTRACTED`
- test_context_manager_and_stats() `EXTRACTED`
- test_match_high_score() `EXTRACTED`
- test_skills_reordered_by_jd_relevance() `EXTRACTED`
- test_truth_preserving_zero_hallucination() `EXTRACTED`
- test_insert_and_get_job() `EXTRACTED`
- test_update_application_status() `EXTRACTED`
- test_format_task_title_and_body() `EXTRACTED`
- test_sync_job_task_success() `EXTRACTED`
- test_unconfigured_credentials_safe_fallback() `EXTRACTED`
- test_orchestrator_approval_action() `EXTRACTED`
- test_orchestrator_process_job_scout_mode() `EXTRACTED`
- test_decision_table_auto_apply_vs_need_review() `EXTRACTED`
- test_decision_table_custom_question_forces_need_review() `EXTRACTED`
- test_decision_table_score_bva() `EXTRACTED`
- test_generate_docx_file_structure() `EXTRACTED`
- test_clear_all_jobs() `EXTRACTED`
- test_delete_single_job() `EXTRACTED`
- test_duplicate_protection() `EXTRACTED`
- test_invalid_status_raises_error() `EXTRACTED`
- *…and 10 more `calls` connection(s) not listed (lowest-degree first to go)*

### contains
- [models.py](models.py.md) `EXTRACTED`

### imports
- [app.py](app.py.md) `EXTRACTED`
- orchestrator.py `EXTRACTED`
- test_orchestrator.py `EXTRACTED`
- [cv_builder.py](cv_builder.py.md) `EXTRACTED`
- test_cv_builder.py `EXTRACTED`
- test_database.py `EXTRACTED`
- job_matcher.py `EXTRACTED`
- [test_job_filter.py](test_job_filter.py.md) `EXTRACTED`
- kalibrr.py `EXTRACTED`
- db.py `EXTRACTED`
- [test_screening.py](test_screening.py.md) `EXTRACTED`
- approval.py `EXTRACTED`
- screening.py `EXTRACTED`
- base.py `EXTRACTED`
- microsoft_todo.py `EXTRACTED`
- test_browser_scrapers.py `EXTRACTED`
- test_job_matcher.py `EXTRACTED`
- test_microsoft_todo.py `EXTRACTED`
- glints.py `EXTRACTED`
- jobstreet.py `EXTRACTED`
- *…and 4 more `imports` connection(s) not listed (lowest-degree first to go)*

### inherits
- BaseModel `EXTRACTED`

### references
- .create_or_update_task() `EXTRACTED`
- .build_tailored_content() `EXTRACTED`
- .generate_documents() `EXTRACTED`
- .format_card() `EXTRACTED`
- .render_card() `EXTRACTED`
- .evaluate() `EXTRACTED`
- .calculate_match() `EXTRACTED`
- .evaluate_application_action() `EXTRACTED`
- .normalize_job() `EXTRACTED`
- .normalize_job() `EXTRACTED`
- .normalize_job() `EXTRACTED`
- ._row_to_model() `EXTRACTED`
- .render_daily_report() `EXTRACTED`
- .scrape() `EXTRACTED`
- .scrape() `EXTRACTED`
- .scrape() `EXTRACTED`
- .get_jobs_by_status() `EXTRACTED`
- .insert_job() `EXTRACTED`
- .process_single_job() `EXTRACTED`
- .get_job_by_id() `EXTRACTED`
- *…and 4 more `references` connection(s) not listed (lowest-degree first to go)*

### uses
- [DatabaseManager](DatabaseManager.md) `INFERRED`
- [JobHuntingOrchestrator](JobHuntingOrchestrator.md) `INFERRED`
- [MicrosoftToDoSync](MicrosoftToDoSync.md) `INFERRED`
- [CVBuilder](CVBuilder.md) `INFERRED`
- JobFilter `INFERRED`
- [JobMatcher](JobMatcher.md) `INFERRED`
- ScreeningEvaluator `INFERRED`
- BaseJobScraper `INFERRED`
- ApprovalConsole `INFERRED`
- GlintsScraper `INFERRED`
- JobStreetScraper `INFERRED`
- KalibrrScraper `INFERRED`
- test_glints_scraper_parse_card() `INFERRED`
- test_jobstreet_scraper_parse_card() `INFERRED`
- test_kalibrr_scraper_normalize_job() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*