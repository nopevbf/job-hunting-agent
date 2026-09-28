from typing import Optional, List, Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from database.models import JobPost
from agent.job_matcher import MatchResult

class ApprovalConsole:
    def __init__(self, console: Optional[Console] = None):
        self.console = console or Console()

    def format_card(self, job: JobPost, match_result: Optional[MatchResult] = None) -> str:
        """
        Formats textual representation of approval card as specified in Blueprint section 17.
        """
        score_str = f"{job.match_score:.1f}%" if job.match_score is not None else "N/A"

        salary_str = "Undisclosed"
        if job.salary_min and job.salary_max:
            salary_str = f"Rp{job.salary_min:,} - Rp{job.salary_max:,}"
        elif job.salary_min:
            salary_str = f"Min Rp{job.salary_min:,}"
        elif job.salary_max:
            salary_str = f"Max Rp{job.salary_max:,}"

        matched = match_result.matched_skills if match_result else (job.requirements or [])
        gaps = match_result.gaps if match_result else []

        matched_lines = "\n".join([f"  ✓ {s}" for s in matched]) if matched else "  (None)"
        gap_lines = "\n".join([f"  - {g}" for g in gaps]) if gaps else "  (None)"

        return (
            f"=== JOB APPROVAL CARD ===\n"
            f"Position    : {job.position}\n"
            f"Company     : {job.company}\n"
            f"Source      : {job.source}\n"
            f"Location    : {job.location}\n"
            f"Salary      : {salary_str}\n"
            f"Match Score : {score_str}\n\n"
            f"Strong Match:\n{matched_lines}\n\n"
            f"Missing / Gaps:\n{gap_lines}\n\n"
            f"Generated CV: {job.cv_file or 'Not generated'}\n"
            f"Job URL     : {job.job_url}\n"
            f"========================="
        )

    def render_card(self, job: JobPost, match_result: Optional[MatchResult] = None):
        """Render beautiful Rich terminal panel."""
        card_content = self.format_card(job, match_result)
        panel = Panel(
            card_content,
            title=f"[bold green]Job #{job.id}: {job.position} @ {job.company}[/bold green]",
            subtitle="Actions: [A]pply | [S]kip | [V]iew URL | [Q]uit"
        )
        self.console.print(panel)

    def render_daily_report(self, stats: Dict[str, Any], date_str: str, highest_job: Optional[JobPost] = None):
        """Render Blueprint section 28 Daily Job Hunting Report table."""
        table = Table(title=f"📋 DAILY JOB HUNTING REPORT — {date_str}", show_header=True, header_style="bold magenta")
        table.add_column("Metric", style="cyan", width=24)
        table.add_column("Count / Value", style="bold green")

        table.add_row("Jobs Found", str(stats.get("found", 0)))
        table.add_row("Unique Processed", str(stats.get("unique", 0)))
        table.add_row("Qualified (Score >= 70)", str(stats.get("qualified", 0)))
        table.add_row("Applied", str(stats.get("applied", 0)))
        table.add_row("Waiting Approval", str(stats.get("waiting_approval", 0)))
        table.add_row("Skipped", str(stats.get("skipped", 0)))

        if highest_job:
            table.add_row("Highest Match", f"{highest_job.position} @ {highest_job.company} ({highest_job.match_score:.1f}%)")

        self.console.print(table)
