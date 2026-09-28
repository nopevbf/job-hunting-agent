"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, HelpCircle, Send } from "lucide-react";
import { JobPostData } from "@/lib/types";

interface ScreeningReviewModalProps {
  job: JobPostData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApply: (job: JobPostData, answers: Record<string, any>) => void;
}

export function ScreeningReviewModal({
  job,
  isOpen,
  onClose,
  onConfirmApply,
}: ScreeningReviewModalProps) {
  const [expectedSalary, setExpectedSalary] = useState("9000000");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [willingToRelocate, setWillingToRelocate] = useState("no");

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApply(job, {
      expected_salary: Number(expectedSalary),
      notice_period_days: Number(noticePeriod),
      willing_to_relocate: willingToRelocate === "yes",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal rounded-bento-lg max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-line-subtle mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-bento-sm bg-sage-container flex items-center justify-center text-sage-deep">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-base">
                Review Formulir & Screening
              </h3>
              <p className="text-xs text-ink-muted">
                Untuk: {job.position} @ {job.company}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Factual Auto-filled Summary */}
          <div className="p-3.5 rounded-bento-sm bg-sage-light/60 border border-sage-primary/20 space-y-2">
            <div className="flex items-center gap-1.5 text-sage-deep font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Data Faktual (Otomatis dari Master Profile)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-base pt-1">
              <div><span className="text-ink-muted">Nama:</span> Eka Pratama</div>
              <div><span className="text-ink-muted">Email:</span> eka.pratama.qa@example.com</div>
              <div><span className="text-ink-muted">No. HP:</span> +6281234567890</div>
              <div><span className="text-ink-muted">Pengalaman:</span> 4 Tahun (QA)</div>
              <div><span className="text-ink-muted">Domisili:</span> Yogyakarta</div>
              <div><span className="text-ink-muted">Pendidikan:</span> S.Kom - UGM</div>
            </div>
          </div>

          {/* Decision Screening Questions */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-ink-base">
              <HelpCircle className="w-3.5 h-3.5 text-terracotta-accent" />
              <span>Pertanyaan yang Membutuhkan Keputusan Anda:</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-base mb-1">
                Gaji yang Diharapkan (Expected Salary - IDR) *
              </label>
              <input
                type="number"
                required
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                className="w-full px-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-base mb-1">
                  Notice Period (Hari) *
                </label>
                <input
                  type="number"
                  required
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-base mb-1">
                  Bersedia Relokasi? *
                </label>
                <select
                  value={willingToRelocate}
                  onChange={(e) => setWillingToRelocate(e.target.value)}
                  className="w-full px-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                >
                  <option value="no">Tidak (Prefer Remote/Yogyakarta)</option>
                  <option value="yes">Ya, Bersedia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-line-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-bento-sm text-ink-muted hover:text-ink-base hover:bg-white/60 font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-bento-sm bg-terracotta-accent hover:bg-terracotta-deep text-canvas-base font-semibold shadow-sm transition hover:shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Konfirmasi & Submit Lamaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
