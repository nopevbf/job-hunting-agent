import os
import sys
import json
import argparse
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from rich.console import Console
from rich.prompt import Prompt

# Load environment
load_dotenv()

# Configure UTF-8 for Windows PowerShell / Terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from database.db import DatabaseManager
from database.models import JobPost, ApplicationStatus
from agent.job_filter import JobFilter
from agent.job_matcher import JobMatcher
from agent.cv_builder import CVBuilder
from agent.screening import ScreeningEvaluator
from agent.approval import ApprovalConsole
from agent.orchestrator import JobHuntingOrchestrator
from integrations.microsoft_todo import MicrosoftToDoSync
from browser.glints import GlintsScraper
from browser.jobstreet import JobStreetScraper
from browser.kalibrr import KalibrrScraper

console = Console()
logging.basicConfig(
    filename="logs/job_agent.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

def load_json_file(file_path: str) -> dict:
    p = Path(file_path)
    if not p.exists():
        console.print(f"[bold red]Error:[/] File {file_path} not found.")
        sys.exit(1)
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def get_orchestrator(mode: str = "ASSISTED") -> JobHuntingOrchestrator:
    db = DatabaseManager("database/jobs.db")
    db.init_db()

    profile = load_json_file("profile/profile.json")
    preferences = load_json_file("profile/preferences.json")

    job_filter = JobFilter(preferences)
    job_matcher = JobMatcher(profile)
    cv_builder = CVBuilder(profile, base_output_dir="cv/generated")
    screening = ScreeningEvaluator(profile, preferences)

    todo_sync = None
    if os.getenv("MICROSOFT_CLIENT_ID"):
        todo_sync = MicrosoftToDoSync()

    return JobHuntingOrchestrator(
        db=db,
        job_filter=job_filter,
        job_matcher=job_matcher,
        cv_builder=cv_builder,
        screening_evaluator=screening,
        todo_sync=todo_sync,
        mode=mode
    )

def cmd_search(args):
    mode = (args.mode or os.getenv("JOB_AGENT_MODE", "ASSISTED")).upper()
    console.print(f"\n[bold cyan]🚀 Starting Job Hunting Agent in [{mode}] Mode...[/bold cyan]")
    orch = get_orchestrator(mode=mode)
    query = getattr(args, "query", None) or "QA Engineer"
    console.print(f"[bold green]🔍 Menjalankan scraper pencarian: '{query}'...[/bold green]")
    jobstreet_adapter = JobStreetScraper()
    kalibrr_adapter = KalibrrScraper()
    glints_adapter = GlintsScraper()

    normalized_jobs = []

    # 1. Scrape real jobs from JobStreet Indonesia
    try:
        console.print(f"[dim]→ Mengambil lowongan '{query}' dari JobStreet Indonesia...[/dim]")
        js_jobs = jobstreet_adapter.scrape(keyword=query, limit=10)
        normalized_jobs.extend(js_jobs)
        console.print(f"[green]✓ Ditemukan {len(js_jobs)} lowongan dari JobStreet[/green]")
    except Exception as e:
        console.print(f"[yellow]Peringatan scraper JobStreet:[/] {e}")

    # 2. Scrape real jobs from Kalibrr Indonesia
    try:
        console.print(f"[dim]→ Mengambil lowongan '{query}' dari Kalibrr Indonesia...[/dim]")
        kl_jobs = kalibrr_adapter.scrape(keyword=query, limit=10)
        normalized_jobs.extend(kl_jobs)
        console.print(f"[green]✓ Ditemukan {len(kl_jobs)} lowongan dari Kalibrr[/green]")
    except Exception as e:
        console.print(f"[yellow]Peringatan scraper Kalibrr:[/] {e}")

    # 3. Scrape real jobs from Glints Indonesia
    try:
        console.print(f"[dim]→ Mengambil lowongan '{query}' dari Glints Indonesia...[/dim]")
        gl_jobs = glints_adapter.scrape(keyword=query, limit=10)
        normalized_jobs.extend(gl_jobs)
        console.print(f"[green]✓ Ditemukan {len(gl_jobs)} lowongan dari Glints[/green]")
    except Exception as e:
        console.print(f"[yellow]Peringatan scraper Glints:[/] {e}")

    found_count = len(normalized_jobs)
    processed_count = 0
    qualified_count = 0

    for job in normalized_jobs:
        processed = orch.process_single_job(job)
        if processed:
            processed_count += 1
            if processed.match_score and processed.match_score >= 70.0:
                qualified_count += 1
                console.print(f"[green]✓ Matched:[/] {processed.position} @ {processed.company} (Score: [bold]{processed.match_score:.1f}%[/bold])")
                console.print(f"   CV Generated: [dim]{processed.cv_file}[/dim]")

    console.print(f"\n[bold]Summary:[/] Found {found_count} | Processed {processed_count} | Qualified {qualified_count}")

    # Otomatis sinkronkan hasil pencarian ke Web Dashboard
    try:
        from database.firestore_sync import sync_sqlite_to_firestore
        sync_sqlite_to_firestore()
    except Exception as e:
        logger.warning(f"Sync to firestore/web skipped: {e}")

    if mode == "ASSISTED":
        cmd_pending(args)

def cmd_pending(args):
    """Review jobs waiting for user approval."""
    orch = get_orchestrator()
    approval_ui = ApprovalConsole(console=console)
    pending_jobs = orch.db.get_jobs_by_status(ApplicationStatus.READY_TO_APPLY)
    pending_jobs += orch.db.get_jobs_by_status(ApplicationStatus.NEED_REVIEW)

    if not pending_jobs:
        console.print("[yellow]No applications waiting for review.[/yellow]")
        return

    console.print(f"\n[bold yellow]Found {len(pending_jobs)} applications waiting for your approval:[/bold yellow]\n")

    for job in pending_jobs:
        approval_ui.render_card(job)
        choice = Prompt.ask("Choose action", choices=["a", "s", "v", "q"], default="a")
        if choice == "a":
            orch.apply_job(job.id)
            console.print(f"[bold green]✓ Application submitted for {job.position} @ {job.company}![/bold green]\n")
        elif choice == "s":
            orch.skip_job(job.id)
            console.print(f"[dim]Skipped {job.position} @ {job.company}.[/dim]\n")
        elif choice == "v":
            console.print(f"Opening URL: {job.job_url}")
        elif choice == "q":
            break

def cmd_report(args):
    """Show daily report."""
    db = DatabaseManager("database/jobs.db")
    db.init_db()
    stats = db.get_stats()
    today_str = datetime.now().strftime("%d %B %Y")
    ui = ApprovalConsole(console=console)

    all_jobs = []
    cursor = db.conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY match_score DESC LIMIT 1")
    row = cursor.fetchone()
    highest_job = db._row_to_model(row) if row else None

    report_stats = {
        "found": sum(stats.values()),
        "unique": sum(stats.values()),
        "qualified": stats.get("READY_TO_APPLY", 0) + stats.get("APPLIED", 0),
        "applied": stats.get("APPLIED", 0),
        "waiting_approval": stats.get("READY_TO_APPLY", 0) + stats.get("NEED_REVIEW", 0),
        "skipped": stats.get("SKIPPED", 0)
    }
    ui.render_daily_report(report_stats, today_str, highest_job)

def main():
    parser = argparse.ArgumentParser(description="Job Hunting Agent — Personal AI Assistant")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Search / Scout command
    search_parser = subparsers.add_parser("search", help="Search job portals, analyze, tailor CV, and prompt for apply")
    search_parser.add_argument("--query", "-q", default="QA Engineer", help="Job query keyword")
    search_parser.add_argument("--mode", "-m", choices=["SCOUT", "ASSISTED", "AUTO"], default="ASSISTED")

    scout_parser = subparsers.add_parser("scout", help="Run in Scout mode (search and analyze without applying)")
    scout_parser.add_argument("--query", "-q", default="QA Engineer", help="Job query keyword")

    # Pending / Review command
    subparsers.add_parser("pending", help="Review and approve pending applications")

    # Report command
    subparsers.add_parser("report", help="View daily job hunting report")

    args = parser.parse_args()

    if args.command in ["search", "scout", None]:
        if args.command == "scout":
            args.mode = "SCOUT"
        elif not hasattr(args, "mode"):
            args.mode = "ASSISTED"
        cmd_search(args)
    elif args.command == "pending":
        cmd_pending(args)
    elif args.command == "report":
        cmd_report(args)

if __name__ == "__main__":
    main()
