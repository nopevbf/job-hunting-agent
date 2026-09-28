"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle, FileText, Mail, Copy, CheckCheck } from "lucide-react";
import { JobPostData } from "@/lib/types";
import { generateTailoredCoverLetter } from "@/lib/cover_letter";

interface CVPreviewModalProps {
  job: JobPostData | null;
  onClose: () => void;
}

export function CVPreviewModal({ job, onClose }: CVPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"CV" | "COVER_LETTER">("CV");
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const cv = job.tailored_cv;
  const coverLetterText = generateTailoredCoverLetter(job);

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal rounded-bento-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line-subtle flex items-center justify-between bg-white/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-ink-base">
                Dokumen Lamaran: {job.position}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sage-container text-sage-deep">
                {job.company}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Truth-Preserving Tailoring • Zero Hallucination Guarantee
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-muted hover:text-ink-base hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-line-subtle bg-canvas-base/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("CV")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "CV"
                  ? "bg-sage-deep text-canvas-base shadow-sm"
                  : "text-ink-muted hover:text-ink-base hover:bg-white/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume (CV ATS)</span>
            </button>

            <button
              onClick={() => setActiveTab("COVER_LETTER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "COVER_LETTER"
                  ? "bg-sage-deep text-canvas-base shadow-sm"
                  : "text-ink-muted hover:text-ink-base hover:bg-white/50"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
            </button>
          </div>

          {activeTab === "COVER_LETTER" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white hover:bg-canvas-tint text-sage-deep border border-line-subtle transition"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-sage-deep" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-ink-base">
          {activeTab === "CV" ? (
            <>
              {/* Gap Analysis Box */}
              <div className="p-4 rounded-bento-sm bg-terracotta-soft/30 border border-terracotta-soft/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-terracotta-accent mb-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Analisis Kesenjangan Kualifikasi (Gap Analysis)</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Skill yang diminta lowongan namun belum tercantum di Master Profile sengaja
                  <strong> TIDAK ditambahkan ke resume</strong> agar data tetap faktual 100%:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.gaps && job.gaps.length > 0 ? (
                    job.gaps.map((gap, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded bg-white text-terracotta-accent font-medium border border-terracotta-soft"
                      >
                        • {gap}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-deep font-medium">✓ Seluruh kualifikasi utama terpenuhi!</span>
                  )}
                </div>
              </div>

              {/* Resume Document Simulation (ATS-Friendly Style) */}
              <div className="p-6 bg-white rounded-bento-sm border border-line-subtle shadow-sm space-y-5">
                {/* Candidate Header */}
                <div className="border-b border-line-subtle pb-4">
                  <h2 className="font-display font-extrabold text-2xl text-ink-base">
                    {cv?.name || "Firman Aji Prasetyo"}
                  </h2>
                  <div className="text-sm font-semibold text-sage-deep mt-0.5">
                    {cv?.title || "QA Engineer | Test Automation | ISTQB-Aligned"}
                  </div>
                  <div className="text-xs text-ink-muted mt-1.5 flex flex-wrap gap-3">
                    <span>Srumbung, Jawa Tengah</span>
                    <span>•</span>
                    <span>firajitio@gmail.com</span>
                    <span>•</span>
                    <span>+62-851-7337-0796</span>
                    <span>•</span>
                    <span>linkedin.com/in/nopevbf</span>
                  </div>
                </div>

                {/* Professional Summary */}
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-sage-deep mb-1.5">
                    Professional Summary
                  </h4>
                  <p className="text-xs text-ink-base leading-relaxed">
                    {cv?.summary ||
                      "QA Engineer with 1.5+ years of experience delivering quality across 6 concurrent projects in PropertyTech and Fintech domains. Specializes in reducing defect leakage, building test automation suites (Selenium, Playwright, Appium), and applying ISTQB-aligned techniques (EP, BVA, Decision Table). Proven track record of cutting regression time by 67% and driving 30% reduction in production defects."}
                  </p>
                </div>

                {/* Prioritized Skills */}
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-sage-deep mb-2">
                    Technical Skills (Reordered for JD)
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {cv?.skills ? (
                      Object.entries(cv.skills).map(([cat, skills]) => (
                        <div key={cat} className="flex items-start gap-2">
                          <span className="font-semibold text-ink-base min-w-[140px]">{cat}:</span>
                          <span className="text-ink-muted">{skills.join(", ")}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-ink-muted">Manual Testing, Selenium, Playwright, Postman, Grafana, ISTQB, SQL</div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-sage-deep mb-2">
                    Professional Experience
                  </h4>
                  <div className="space-y-3.5">
                    {(cv?.experiences || [
                      {
                        company: "PT. Royal D'Paragon Land",
                        role: "Quality Assurance Engineer",
                        location: "Depok, Yogyakarta · On-site",
                        start_date: "2025-03",
                        end_date: "2026-04",
                        bullets: [
                          "Managed QA across 6 concurrent projects (booking, payment, finance, reservation, self check-in, ops).",
                          "Reduced defect leakage to production by ~30% and traced bugs using Grafana.",
                          "Automated 70% of the regression suite using Selenium and applied ISTQB techniques (EP, BVA, Decision Table).",
                        ],
                      },
                      {
                        company: "Test IO Community",
                        role: "Software Tester (Freelance)",
                        location: "Remote",
                        start_date: "2024-11",
                        end_date: "Present",
                        bullets: [
                          "Executed manual and exploratory testing across diverse web applications within tight time constraints.",
                          "Produced detailed defect reports with reproduction steps, severity, and screenshots minimizing report rejections.",
                        ],
                      },
                    ]).map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink-base">
                          <span>{exp.role} — {exp.company}</span>
                          <span className="text-ink-muted font-normal">{exp.start_date} - {exp.end_date}</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-ink-muted space-y-1 pl-1">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Cover Letter Tab */
            <div className="p-6 bg-white rounded-bento-sm border border-line-subtle shadow-sm">
              <div className="border-b border-line-subtle pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-ink-base">Cover Letter Formal</h4>
                  <p className="text-xs text-ink-muted">Disesuaikan dengan profil dan bahasa Job Description</p>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-base bg-canvas-base/30 p-4 rounded-bento-sm border border-line-subtle">
                {coverLetterText}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-line-subtle bg-white/60 flex items-center justify-between">
          <span className="text-xs text-ink-muted">
            Format: ATS-Friendly Single Column & Text-Selectable
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-bento-sm bg-sage-deep hover:bg-[#284230] text-canvas-base text-xs font-semibold shadow-sm transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
