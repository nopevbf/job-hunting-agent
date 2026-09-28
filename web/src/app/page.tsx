"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/bento/StatsCard";
import { HighMatchCard } from "@/components/bento/HighMatchCard";
import { ProfilePillCard } from "@/components/bento/ProfilePillCard";
import { JobCard } from "@/components/JobCard";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { JobImportModal } from "@/components/JobImportModal";
import { JobPostData, JobHuntingStats } from "@/lib/types";
import { Filter, Layers, Sparkles } from "lucide-react";

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
  const [filterTab, setFilterTab] = useState<"ALL" | "READY" | "APPLIED" | "SKIPPED">("ALL");
  const [selectedCVJob, setSelectedCVJob] = useState<JobPostData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial data
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

  // Handle Apply Action
  const handleApply = async (job: JobPostData) => {
    if (!job.id) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPLIED" }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: "APPLIED" } : j))
        );
        fetchData(); // refresh counts
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
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
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
              onApply={handleApply}
              onViewCV={(job) => setSelectedCVJob(job)}
            />
          </div>

          {/* Medium Card (Span 4) */}
          <div className="lg:col-span-4">
            <ProfilePillCard />
          </div>
        </section>

        {/* Feed Header & Filters */}
        <section className="pt-3">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-line-subtle">
            <div>
              <h2 className="font-display font-bold text-xl text-ink-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-sage-deep" />
                Daftar Peluang Lowongan
              </h2>
              <p className="text-xs text-ink-muted">
                Peringkat lowongan hasil filter & evaluasi kualifikasi real-time
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
                  onApply={handleApply}
                  onSkip={handleSkip}
                  onViewCV={(j) => setSelectedCVJob(j)}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center glass-card rounded-bento-md">
                <p className="text-sm font-semibold text-ink-base">Tidak ada lowongan di kategori ini.</p>
                <p className="text-xs text-ink-muted mt-1">Coba ganti filter atau import lowongan baru.</p>
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

      <JobImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchData()}
      />
    </div>
  );
}
