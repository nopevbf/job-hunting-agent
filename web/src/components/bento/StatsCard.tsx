import React from "react";
import { CheckCircle2, Clock, Send, EyeOff } from "lucide-react";
import { JobHuntingStats } from "@/lib/types";

interface StatsCardProps {
  stats: JobHuntingStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
      {/* 1. Lowongan Ditemukan */}
      <div className="glass-card rounded-bento-md p-4 flex flex-col justify-between transition hover:-translate-y-0.5 duration-200">
        <div className="flex items-center justify-between text-ink-muted">
          <span className="text-xs font-semibold">Total Terpantau</span>
          <span className="w-2 h-2 rounded-full bg-sage-deep/40"></span>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-display font-bold text-ink-base">{stats.found}</span>
          <span className="text-xs text-ink-muted ml-1.5">lowongan</span>
        </div>
        <p className="text-[11px] text-ink-muted mt-1">Dari Glints & JobStreet</p>
      </div>

      {/* 2. Qualified (Match >= 70%) */}
      <div className="glass-card rounded-bento-md p-4 flex flex-col justify-between transition hover:-translate-y-0.5 duration-200">
        <div className="flex items-center justify-between text-sage-deep">
          <span className="text-xs font-semibold">Lolos Kualifikasi</span>
          <CheckCircle2 className="w-4 h-4 text-sage-primary" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-display font-bold text-sage-deep">{stats.qualified}</span>
          <span className="text-xs text-sage-deep/80 ml-1.5">cocok</span>
        </div>
        <p className="text-[11px] text-sage-deep/70 mt-1">Skor kecocokan ≥ 70%</p>
      </div>

      {/* 3. Menunggu Persetujuan (Terracotta Accent) */}
      <div className="glass-card rounded-bento-md p-4 flex flex-col justify-between border-terracotta-soft/50 transition hover:-translate-y-0.5 duration-200">
        <div className="flex items-center justify-between text-terracotta-accent">
          <span className="text-xs font-semibold">Menunggu Review</span>
          <Clock className="w-4 h-4 text-terracotta-accent" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-display font-bold text-terracotta-accent">
            {stats.waiting_approval}
          </span>
          <span className="text-xs text-terracotta-accent/80 ml-1.5">butuh approval</span>
        </div>
        <p className="text-[11px] text-ink-muted mt-1">Siap untuk diapply</p>
      </div>

      {/* 4. Berhasil Diapply */}
      <div className="glass-card rounded-bento-md p-4 flex flex-col justify-between transition hover:-translate-y-0.5 duration-200">
        <div className="flex items-center justify-between text-ink-muted">
          <span className="text-xs font-semibold">Telah Diapply</span>
          <Send className="w-4 h-4 text-sage-deep" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-display font-bold text-ink-base">{stats.applied}</span>
          <span className="text-xs text-ink-muted ml-1.5">terkirim</span>
        </div>
        <p className="text-[11px] text-ink-muted mt-1">Tersinkron ke MS To Do</p>
      </div>
    </div>
  );
}
