"use client";

import React from "react";
import { Building2, MapPin, DollarSign, Check, AlertCircle, ArrowUpRight, FileText, CheckCircle2 } from "lucide-react";
import { JobPostData, ApplicationStatus } from "@/lib/types";

interface JobCardProps {
  job: JobPostData;
  onApply: (job: JobPostData) => void;
  onSkip: (job: JobPostData) => void;
  onViewCV: (job: JobPostData) => void;
}

export function JobCard({ job, onApply, onSkip, onViewCV }: JobCardProps) {
  const score = job.match_score || 0;
  const isApplied = job.status === "APPLIED";
  const isSkipped = job.status === "SKIPPED";

  // Status Badge Formatting
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "READY_TO_APPLY":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-soft text-terracotta-accent">Siap Diapply</span>;
      case "APPLIED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-container text-sage-deep">✓ Telah Diapply</span>;
      case "NEED_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Butuh Review</span>;
      case "SKIPPED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Dilewati</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-light text-sage-deep">{status}</span>;
    }
  };

  // Salary string formatting
  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `Rp${(job.salary_min / 1000000).toFixed(0)}jt - Rp${(job.salary_max / 1000000).toFixed(0)}jt`;
    } else if (job.salary_min) {
      return `Min Rp${(job.salary_min / 1000000).toFixed(0)}jt`;
    } else if (job.salary_max) {
      return `Maks Rp${(job.salary_max / 1000000).toFixed(0)}jt`;
    }
    return "Tidak Disebutkan";
  };

  return (
    <div className={`glass-card rounded-bento-md p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${isSkipped ? "opacity-60" : ""}`}>
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/70 text-ink-muted border border-line-subtle">
              {job.source}
            </span>
            {getStatusBadge(job.status)}
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-1">
            <span className="font-display font-extrabold text-lg text-sage-deep">
              {score.toFixed(0)}%
            </span>
            <span className="text-[11px] text-ink-muted font-medium">match</span>
          </div>
        </div>

        {/* Title & Company */}
        <h3 className="font-display font-bold text-base text-ink-base leading-snug line-clamp-1">
          {job.position}
        </h3>
        <div className="flex items-center gap-3 text-xs text-ink-muted mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-ink-base">
            <Building2 className="w-3.5 h-3.5 text-sage-primary" />
            {job.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sage-primary" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-sage-primary" />
            {formatSalary()}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-ink-muted mt-2.5 line-clamp-2 leading-relaxed">
          {job.job_description}
        </p>

        {/* Matched & Gap tags */}
        <div className="mt-3.5 pt-3 border-t border-line-subtle space-y-2">
          {/* Matched skills */}
          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-sage-deep font-semibold">Matched:</span>
              {job.matched_skills.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded bg-sage-light text-sage-deep"
                >
                  <Check className="w-2.5 h-2.5" />
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Missing Gaps */}
          {job.gaps && job.gaps.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-terracotta-accent font-semibold">Gaps:</span>
              {job.gaps.slice(0, 2).map((g, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded bg-terracotta-soft/50 text-terracotta-accent"
                >
                  <AlertCircle className="w-2.5 h-2.5" />
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-line-subtle flex items-center justify-between gap-2">
        <button
          onClick={() => onViewCV(job)}
          className="flex items-center gap-1 text-xs font-semibold text-sage-deep hover:text-ink-base transition"
        >
          <FileText className="w-3.5 h-3.5 text-sage-primary" />
          <span>Lihat CV</span>
        </button>

        <div className="flex items-center gap-1.5">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-ink-muted hover:text-ink-base rounded-md hover:bg-white/60 transition"
            title="Buka Website Lowongan"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>

          {!isApplied && !isSkipped && (
            <>
              <button
                onClick={() => onSkip(job)}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-muted hover:text-ink-base hover:bg-white/60 transition"
              >
                Lewati
              </button>

              <button
                onClick={() => onApply(job)}
                className="px-3 py-1.5 rounded-bento-sm bg-sage-deep hover:bg-[#284230] text-canvas-base text-xs font-semibold transition shadow-sm hover:shadow"
              >
                Lamar
              </button>
            </>
          )}

          {isApplied && (
            <span className="text-xs font-semibold text-sage-deep flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Diapply
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
