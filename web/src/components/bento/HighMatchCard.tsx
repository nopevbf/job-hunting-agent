import React from "react";
import { Award, ArrowUpRight, Check, MapPin, Building2 } from "lucide-react";
import { JobPostData } from "@/lib/types";

interface HighMatchCardProps {
  job?: JobPostData | null;
  onApply: (job: JobPostData) => void;
  onViewCV: (job: JobPostData) => void;
}

export function HighMatchCard({ job, onApply, onViewCV }: HighMatchCardProps) {
  if (!job) {
    return (
      <div className="glass-card rounded-bento-lg p-6 flex flex-col justify-center items-center text-center h-full min-h-[220px]">
        <Award className="w-10 h-10 text-sage-primary/40 mb-2" />
        <h3 className="font-display font-bold text-base text-ink-base">Belum Ada Lowongan Unggulan</h3>
        <p className="text-xs text-ink-muted max-w-xs mt-1">
          Import atau jalankan pencarian untuk menemukan lowongan dengan kecocokan tertinggi.
        </p>
      </div>
    );
  }

  const score = job.match_score || 0;
  const isApplied = job.status === "APPLIED";

  return (
    <div className="glass-card rounded-bento-lg p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden h-full min-h-[260px] border border-white/80">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sage-primary/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-soft text-terracotta-accent">
            <Award className="w-3.5 h-3.5" />
            Rekomendasi Utama Hari Ini
          </span>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-container text-sage-deep">
            {job.source}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-ink-base tracking-tight">
              {job.position}
            </h2>
            <div className="flex items-center gap-3 text-sm text-ink-muted mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
            </div>
          </div>

          {/* Match Score Display */}
          <div className="text-right flex-shrink-0">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-sage-deep">
              {score.toFixed(0)}%
            </div>
            <div className="text-[11px] font-semibold text-sage-primary uppercase tracking-wider">
              Match Score
            </div>
          </div>
        </div>

        {/* Matched Skills Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(job.requirements || []).slice(0, 5).map((req, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/70 text-ink-base border border-line-subtle"
            >
              <Check className="w-3 h-3 text-sage-primary" />
              {req}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-line-subtle flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => onViewCV(job)}
          className="text-xs sm:text-sm font-semibold text-sage-deep hover:text-ink-base underline-offset-4 hover:underline transition"
        >
          Lihat Draft CV Ter-tailor →
        </button>

        <div className="flex items-center gap-2">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-ink-muted hover:text-ink-base rounded-bento-sm hover:bg-white/50 transition"
            title="Buka URL Lowongan"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>

          {!isApplied ? (
            <button
              onClick={() => onApply(job)}
              className="px-4 py-2 rounded-bento-sm bg-terracotta-accent hover:bg-terracotta-deep text-canvas-base text-xs sm:text-sm font-semibold shadow-sm transition hover:shadow"
            >
              Lamar Sekarang
            </button>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-bento-sm text-xs font-semibold bg-sage-container text-sage-deep">
              ✓ Sudah Diapply
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
