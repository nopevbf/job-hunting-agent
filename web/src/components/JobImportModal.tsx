"use client";

import React, { useState } from "react";
import { X, Sparkles, Building2, Briefcase, MapPin, Link2, Loader2 } from "lucide-react";
import { JobPostData } from "@/lib/types";

interface JobImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (job: JobPostData) => void;
}

export function JobImportModal({ isOpen, onClose, onImportSuccess }: JobImportModalProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("Yogyakarta");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !jobDescription) {
      setErrorMsg("Mohon isi Perusahaan, Posisi, dan Job Description.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          position,
          location,
          job_url: jobUrl || `https://example.com/job-${Date.now()}`,
          job_description: jobDescription,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menganalisis lowongan.");
      }

      onImportSuccess(json.data);
      onClose();
      // Reset form
      setCompany("");
      setPosition("");
      setJobDescription("");
      setJobUrl("");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal rounded-bento-lg max-w-xl w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line-subtle mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-bento-sm bg-terracotta-soft/60 flex items-center justify-center text-terracotta-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-base">
                Import Lowongan Baru
              </h3>
              <p className="text-xs text-ink-muted">Analisis AI & Truth-Preserving Matching</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-muted hover:text-ink-base hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-bento-sm bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink-base mb-1">Perusahaan *</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Misal: GoTo, Shopee"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-base mb-1">Posisi Lowongan *</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Misal: QA Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink-base mb-1">Lokasi</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Yogyakarta / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-base mb-1">URL Lowongan</label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-base mb-1">
              Job Description / Requirements *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Paste deskripsi pekerjaan dan requirement lowongan di sini..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 rounded-bento-sm bg-canvas-base border border-line-subtle focus:outline-none focus:ring-1 focus:ring-sage-deep resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-bento-sm text-ink-muted hover:text-ink-base hover:bg-white/60 font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-bento-sm bg-sage-deep hover:bg-[#284230] text-canvas-base font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-soft" />
                  <span>Analisis & Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
