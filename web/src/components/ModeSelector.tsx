"use client";

import React from "react";
import { Radar, UserCheck, Zap } from "lucide-react";
import { AgentMode } from "@/lib/decision_engine";

interface ModeSelectorProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes: Array<{
    id: AgentMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
    isRecommended?: boolean;
  }> = [
    {
      id: "SCOUT",
      label: "Mode 1 — Scout",
      icon: <Radar className="w-3.5 h-3.5" />,
      desc: "Hanya mencari & analisa, tanpa apply",
    },
    {
      id: "ASSISTED",
      label: "Mode 2 — Assisted",
      icon: <UserCheck className="w-3.5 h-3.5" />,
      desc: "Stop & minta approval sebelum submit",
      isRecommended: true,
    },
    {
      id: "AUTO",
      label: "Mode 3 — Auto Apply",
      icon: <Zap className="w-3.5 h-3.5" />,
      desc: "Auto submit jika skor ≥ 85% & rule lolos",
    },
  ];

  return (
    <div className="glass-card rounded-bento-sm p-1.5 flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition relative ${
              isActive
                ? "bg-sage-deep text-canvas-base shadow-sm"
                : "text-ink-muted hover:text-ink-base hover:bg-white/50"
            }`}
            title={m.desc}
          >
            {m.icon}
            <span>{m.label}</span>
            {m.isRecommended && (
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                  isActive ? "bg-terracotta-accent text-white" : "bg-terracotta-soft text-terracotta-accent"
                }`}
              >
                Default
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
