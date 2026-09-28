import React from "react";
import { User, ShieldCheck, MapPin, DollarSign, Check } from "lucide-react";

export function ProfilePillCard() {
  return (
    <div className="glass-card rounded-bento-md p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sage-deep/15 flex items-center justify-center text-sage-deep font-display font-bold text-sm">
              FP
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-ink-base leading-snug">Firman Aji Prasetyo</h3>
              <p className="text-xs text-ink-muted">QA Engineer (1.5+ Thn)</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sage-container text-sage-deep">
            <ShieldCheck className="w-3 h-3 text-sage-deep" />
            Verified Profile
          </span>
        </div>

        {/* Preferences Quick Info */}
        <div className="space-y-1.5 text-xs text-ink-muted pt-2 border-t border-line-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sage-primary" /> Target Lokasi:
            </span>
            <span className="font-medium text-ink-base">Yogyakarta & Remote</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-sage-primary" /> Min. Gaji:
            </span>
            <span className="font-medium text-ink-base">Rp 6.000.000</span>
          </div>
        </div>

        {/* Core Stack Badges */}
        <div className="mt-3.5 pt-2.5 border-t border-line-subtle">
          <span className="text-[11px] font-semibold text-ink-muted block mb-1.5">Master Stack:</span>
          <div className="flex flex-wrap gap-1">
            {["Selenium", "Playwright", "ISTQB", "Postman", "Grafana", "SQL"].map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/60 text-ink-base border border-line-subtle"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 text-[11px] text-ink-muted">
        <span>Prinsip: </span>
        <span className="text-sage-deep font-semibold">Zero-Hallucination CV Tailoring</span>
      </div>
    </div>
  );
}
