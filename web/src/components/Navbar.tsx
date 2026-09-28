"use client";

import React from "react";
import { Sparkles, PlusCircle, RefreshCw, ClipboardList } from "lucide-react";

interface NavbarProps {
  onOpenImport: () => void;
  onOpenReport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function Navbar({ onOpenImport, onOpenReport, onRefresh, isRefreshing }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-bento-sm bg-sage-deep flex items-center justify-center text-canvas-base shadow-sm">
            <Sparkles className="w-5 h-5 text-terracotta-soft" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-ink-base tracking-tight">
                Job Hunting Agent
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sage-container text-sage-deep">
                Live Firestore
              </span>
            </div>
            <p className="text-xs text-ink-muted">Personal AI & Truth-Preserving CV Optimizer</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-ink-base rounded-bento-sm hover:bg-white/60 transition border border-line-subtle"
            title="Buka Laporan Harian"
          >
            <ClipboardList className="w-4 h-4 text-sage-deep" />
            <span className="hidden sm:inline">Laporan Harian</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink-base rounded-bento-sm hover:bg-white/40 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sage-deep" : ""}`} />
            <span className="hidden md:inline">Segarkan</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-bento-sm bg-sage-deep hover:bg-[#284230] text-canvas-base text-xs sm:text-sm font-semibold shadow-sm transition hover:shadow"
          >
            <PlusCircle className="w-4 h-4 text-terracotta-soft" />
            <span>Import Lowongan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
