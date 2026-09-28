"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/bento/StatsCard";
import { HighMatchCard } from "@/components/bento/HighMatchCard";
import { ProfilePillCard } from "@/components/bento/ProfilePillCard";
import { JobCard } from "@/components/JobCard";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { JobImportModal } from "@/components/JobImportModal";
import { ScreeningReviewModal } from "@/components/ScreeningReviewModal";
import { DailyReportModal } from "@/components/DailyReportModal";
import { ModeSelector } from "@/components/ModeSelector";
import { JobPostData, JobHuntingStats } from "@/lib/types";
import { AgentMode, evaluateModeDecision } from "@/lib/decision_engine";
import { Search, Sparkles, Layers, Loader2, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobPostData[]>([]);
  const [stats, setStats] = useState<JobHuntingStats>({
    found: 0,
    unique: 0,
    qualified: 0,
    applied: 0,
    waiting_approval: 0,
    skipped: 0,
  });
  const [mode, setMode] = useState<AgentMode>("ASSISTED");
  const [filterTab, setFilterTab] = useState<"ALL" | "READY" | "APPLIED" | "SKIPPED">("ALL");

  // Modals state
  const [selectedCVJob, setSelectedCVJob] = useState<JobPostData | null>(null);
  const [screeningJob, setScreeningJob] = useState<JobPostData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Command bar search state
  const [searchQuery, setSearchQuery] = useState("QA Engineer");
  const [isScouting, setIsScouting] = useState(false);
  const [scoutMessage, setScoutMessage] = useState("");

  // Fetch jobs and stats from Firestore
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/stats"),
      ]);
      const jobsJson = await jobsRes.json();
      const statsJson = await statsRes.json();

      if (jobsJson.success) setJobs(jobsJson.data);
      if (statsJson.success) setStats(statsJson.data);
    } catch (err) {
      console.error("Failed to load jobs/stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger Scout Search (Multi-Portal Search Agent)
  const handleTriggerScout = async () => {
    setIsScouting(true);
    setScoutMessage(`Memindai platform (Glints, JobStreet, Dealls) untuk '${searchQuery}'...`);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const json = await res.json();
      if (json.success) {
        setScoutMessage(`✓ Selesai: Memindai ${json.data.total_scanned} lowongan, ${json.data.qualified} lolos kualifikasi & di-generate CV.`);
        await fetchData();

        // If in Auto-Apply mode, trigger auto application for high matches
        if (mode === "AUTO") {
          for (const newJob of json.data.jobs) {
            const decision = evaluateModeDecision({ mode: "AUTO", job: newJob });
            if (decision.action === "AUTO_APPLY") {
              await fetch(`/api/jobs/${newJob.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPLIED" }),
              });
            }
          }
          await fetchData();
        }
      }
    } catch (err) {
      setScoutMessage(`Gagal menjalankan scout: ${(err as Error).message}`);
    } finally {
      setIsScouting(false);
      setTimeout(() => setScoutMessage(""), 6000);
    }
  };

  // Handle Apply Click
  const handleApplyClick = (job: JobPostData) => {
    if (mode === "SCOUT") {
      alert("Mode Scout aktif (Hanya observasi). Ubah mode ke 'Assisted' atau 'Auto' untuk melamar.");
      return;
    }
    // In Assisted mode: Open screening confirmation modal
    setScreeningJob(job);
  };

  // Confirm Apply from Screening Modal
  const handleConfirmApply = async (job: JobPostData, answers: Record<string, any>) => {
    if (!job.id) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPLIED", screening_answers: answers }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: "APPLIED" } : j))
        );
        fetchData();
      }
    } catch (err) {
      console.error("Apply failed:", err);
    }
  };

  // Handle Skip Action
  const handleSkip = async (job: JobPostData) => {
    if (!job.id) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SKIPPED" }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: "SKIPPED" } : j))
        );
        fetchData();
      }
    } catch (err) {
      console.error("Skip failed:", err);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    if (filterTab === "READY") return job.status === "READY_TO_APPLY" || job.status === "NEED_REVIEW";
    if (filterTab === "APPLIED") return job.status === "APPLIED";
    if (filterTab === "SKIPPED") return job.status === "SKIPPED";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Command Search Bar & Mode Selector Row */}
        <section className="glass-card rounded-bento-md p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/80">
          {/* Natural Command Search Form */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Perintah: Cari kerja QA Engineer hari ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep font-medium"
              />
            </div>
            <button
              onClick={handleTriggerScout}
              disabled={isScouting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-bento-sm bg-terracotta-accent hover:bg-terracotta-deep text-canvas-base text-xs sm:text-sm font-semibold shadow-sm transition hover:shadow flex-shrink-0 disabled:opacity-50"
            >
              {isScouting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memindai...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-soft" />
                  <span>Cari Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Selector Toggle */}
          <div className="w-full md:w-auto flex justify-end">
            <ModeSelector currentMode={mode} onModeChange={(m) => setMode(m)} />
          </div>
        </section>

        {/* Scout Status Banner */}
        {scoutMessage && (
          <div className="p-3 rounded-bento-sm bg-sage-container/70 border border-sage-primary/30 text-sage-deep text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-sage-deep flex-shrink-0" />
            <span>{scoutMessage}</span>
          </div>
        )}

        {/* Top Bento Stats Bar */}
        <section>
          <StatsCard stats={stats} />
        </section>

        {/* Bento Grid 2.0 Hero Row (Asymmetric Spans) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Large Hero Card (Span 8) */}
          <div className="lg:col-span-8">
            <HighMatchCard
              job={stats.highest_match}
              onApply={handleApplyClick}
              onViewCV={(job) => setSelectedCVJob(job)}
            />
          </div>

          {/* Medium Card (Span 4) */}
          <div className="lg:col-span-4">
            <ProfilePillCard />
          </div>
        </section>

        {/* Feed Header & Filters */}
        <section className="pt-2">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-line-subtle">
            <div>
              <h2 className="font-display font-bold text-xl text-ink-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-sage-deep" />
                Daftar Peluang Lowongan
              </h2>
              <p className="text-xs text-ink-muted">
                Peringkat lowongan hasil filter & evaluasi kualifikasi real-time (Mode: {mode})
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-1 rounded-bento-sm bg-canvas-tint/70 border border-line-subtle">
              <button
                onClick={() => setFilterTab("ALL")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  filterTab === "ALL"
                    ? "bg-white text-ink-base shadow-sm"
                    : "text-ink-muted hover:text-ink-base"
                }`}
              >
                Semua ({jobs.length})
              </button>
              <button
                onClick={() => setFilterTab("READY")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  filterTab === "READY"
                    ? "bg-white text-terracotta-accent shadow-sm"
                    : "text-ink-muted hover:text-ink-base"
                }`}
              >
                Siap Diapply ({stats.waiting_approval})
              </button>
              <button
                onClick={() => setFilterTab("APPLIED")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  filterTab === "APPLIED"
                    ? "bg-white text-sage-deep shadow-sm"
                    : "text-ink-muted hover:text-ink-base"
                }`}
              >
                Diapply ({stats.applied})
              </button>
              <button
                onClick={() => setFilterTab("SKIPPED")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  filterTab === "SKIPPED"
                    ? "bg-white text-ink-muted shadow-sm"
                    : "text-ink-muted hover:text-ink-base"
                }`}
              >
                Dilewati ({stats.skipped})
              </button>
            </div>
          </div>

          {/* Cards Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApplyClick}
                  onSkip={handleSkip}
                  onViewCV={(j) => setSelectedCVJob(j)}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center glass-card rounded-bento-md">
                <p className="text-sm font-semibold text-ink-base">Tidak ada lowongan di kategori ini.</p>
                <p className="text-xs text-ink-muted mt-1">Coba gunakan bilah pencarian di atas atau import lowongan baru.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <CVPreviewModal
        job={selectedCVJob}
        onClose={() => setSelectedCVJob(null)}
      />

      <ScreeningReviewModal
        job={screeningJob}
        isOpen={Boolean(screeningJob)}
        onClose={() => setScreeningJob(null)}
        onConfirmApply={handleConfirmApply}
      />

      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={stats}
      />

      <JobImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchData()}
      />
    </div>
  );
}
