"use client";

import React from "react";
import { X, ClipboardList, CheckCircle2, Award, Clock, Send, EyeOff, Calendar } from "lucide-react";
import { JobHuntingStats } from "@/lib/types";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: JobHuntingStats;
}

export function DailyReportModal({ isOpen, onClose, stats }: DailyReportModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal rounded-bento-lg max-w-md w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-line-subtle mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-bento-sm bg-sage-deep flex items-center justify-center text-canvas-base">
              <ClipboardList className="w-4 h-4 text-terracotta-soft" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-base">
                Daily Job Hunting Report
              </h3>
              <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-sage-primary" />
                {todayStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-muted hover:text-ink-base hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Metrics List */}
        <div className="divide-y divide-line-subtle text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-ink-muted font-medium">Jobs Found</span>
            <span className="font-display font-bold text-sm text-ink-base">{stats.found}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-ink-muted font-medium">Unique Processed</span>
            <span className="font-display font-bold text-sm text-ink-base">{stats.unique}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-sage-deep font-semibold">Qualified (Match ≥ 70%)</span>
            <span className="font-display font-bold text-sm text-sage-deep">{stats.qualified}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-sage-deep font-medium">Applied</span>
            <span className="font-display font-bold text-sm text-sage-deep">{stats.applied}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-terracotta-accent font-semibold">Waiting Approval</span>
            <span className="font-display font-bold text-sm text-terracotta-accent">
              {stats.waiting_approval}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-ink-muted font-medium">Skipped</span>
            <span className="font-display font-bold text-sm text-ink-muted">{stats.skipped}</span>
          </div>
        </div>

        {/* Highest Match Highlight Box */}
        {stats.highest_match && (
          <div className="mt-4 p-3.5 rounded-bento-sm bg-sage-light/70 border border-sage-primary/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sage-deep mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Highest Match</span>
            </div>
            <div className="text-xs font-bold text-ink-base">
              {stats.highest_match.position} @ {stats.highest_match.company}
            </div>
            <div className="text-[11px] text-sage-deep font-semibold mt-0.5">
              Kecocokan: {stats.highest_match.match_score?.toFixed(1)}%
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-line-subtle text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-bento-sm bg-sage-deep hover:bg-[#284230] text-canvas-base text-xs font-semibold shadow-sm transition"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
}
