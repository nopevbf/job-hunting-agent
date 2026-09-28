import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from database.models import JobPost, ApplicationStatus
from database.db import DatabaseManager
from agent.job_filter import JobFilter
from agent.job_matcher import JobMatcher, MatchResult
from agent.cv_builder import CVBuilder, TailoringIntensity
from agent.screening import ScreeningEvaluator, DecisionAction
from integrations.microsoft_todo import MicrosoftToDoSync

logger = logging.getLogger(__name__)

class JobHuntingOrchestrator:
    def __init__(
        self,
        db: DatabaseManager,
        job_filter: JobFilter,
        job_matcher: JobMatcher,
        cv_builder: CVBuilder,
        screening_evaluator: ScreeningEvaluator,
        todo_sync: Optional[MicrosoftToDoSync] = None,
        mode: str = "ASSISTED"
    ):
        self.db = db
        self.job_filter = job_filter
        self.job_matcher = job_matcher
        self.cv_builder = cv_builder
        self.screening_evaluator = screening_evaluator
        self.todo_sync = todo_sync
        self.mode = mode.upper()  # SCOUT, ASSISTED, AUTO

    def process_single_job(self, raw_job: JobPost, questions: Optional[List[str]] = None) -> Optional[JobPost]:
        """
        End-to-End single job pipeline:
        1. Duplicate Check
        2. Filter Evaluation
        3. Match Scoring (7-dim)
        4. CV Tailoring & Document Generation
        5. Screening & Action Determination
        6. DB Persistence & To Do Sync
        """
        # 1. Duplicate Check
        if self.db.is_duplicate(raw_job.company, raw_job.position, raw_job.job_url):
            logger.info(f"Duplicate job skipped: {raw_job.position} at {raw_job.company}")
            return None

        # 2. Filter Check
        is_valid, filter_reason = self.job_filter.evaluate(raw_job)
        if not is_valid:
            logger.info(f"Job filtered out: {raw_job.position} ({filter_reason})")
            raw_job.status = ApplicationStatus.SKIPPED
            self.db.insert_job(raw_job)
            return None

        # 3. Match Scoring
        match_result: MatchResult = self.job_matcher.calculate_match(raw_job)
        raw_job.match_score = match_result.total_score

        if match_result.total_score < 60.0:
            raw_job.status = ApplicationStatus.SKIPPED
            job_id = self.db.insert_job(raw_job)
            raw_job.id = job_id
            return raw_job

        # 4. Truth-Preserving CV Tailoring
        intensity = TailoringIntensity.HIGH if match_result.total_score >= 85 else TailoringIntensity.MEDIUM
        tailored_content = self.cv_builder.build_tailored_content(raw_job, intensity=intensity)
        docx_path, snapshot_path = self.cv_builder.generate_documents(raw_job, tailored_content)
        raw_job.cv_file = docx_path
        raw_job.snapshot_data = snapshot_path

        # 5. Screening & Mode Action
        action, action_reason = self.screening_evaluator.evaluate_application_action(raw_job, questions=questions)

        if action == DecisionAction.NEED_REVIEW:
            raw_job.status = ApplicationStatus.NEED_REVIEW
        elif self.mode == "AUTO" and action == DecisionAction.AUTO_APPLY:
            raw_job.status = ApplicationStatus.APPLIED
            raw_job.applied_at = datetime.now().isoformat()
        elif match_result.total_score >= 80.0:
            raw_job.status = ApplicationStatus.READY_TO_APPLY
        else:
            raw_job.status = ApplicationStatus.REVIEW

        # 6. Save to Database
        job_id = self.db.insert_job(raw_job)
        raw_job.id = job_id

        # 7. Microsoft To Do Sync if applied
        if raw_job.status == ApplicationStatus.APPLIED and self.todo_sync:
            self.todo_sync.create_or_update_task(raw_job)

        return raw_job

    def apply_job(self, job_id: int) -> bool:
        """User approves applying to job."""
        job = self.db.get_job_by_id(job_id)
        if not job:
            return False

        now = datetime.now().isoformat()
        success = self.db.update_status(
            job_id,
            status=ApplicationStatus.APPLIED,
            applied_at=now
        )
        if success:
            job.status = ApplicationStatus.APPLIED
            job.applied_at = now
            if self.todo_sync:
                self.todo_sync.create_or_update_task(job)
        return success

    def skip_job(self, job_id: int) -> bool:
        """User skips job."""
        return self.db.update_status(job_id, status=ApplicationStatus.SKIPPED)
