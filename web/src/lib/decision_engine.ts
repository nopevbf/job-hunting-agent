import { JobPostData } from "./types";

export type AgentMode = "SCOUT" | "ASSISTED" | "AUTO";

export interface ModeDecision {
  action: "OBSERVE" | "WAITING_APPROVAL" | "NEED_REVIEW" | "AUTO_APPLY" | "SKIP";
  requiresUserApproval: boolean;
  unresolvedQuestions: string[];
  reason: string;
}

export interface ScreeningResolution {
  question: string;
  answer: string | number | boolean;
  isFactual: boolean;
}

const CANDIDATE_DEFAULTS = {
  name: "Firman Aji Prasetyo",
  email: "firajitio@gmail.com",
  phone: "+62-851-7337-0796",
  location: "Srumbung, Jawa Tengah",
  expected_salary: 8000000,
  years_of_experience: 1.5,
  notice_period_days: 14,
  willing_to_relocate: false,
  work_authorization: "Indonesian Citizen",
};

/**
 * Resolves standard screening questions factually from profile defaults.
 */
export function resolveScreeningQuestion(questionText: string): ScreeningResolution | null {
  const q = questionText.toLowerCase();

  if (/\b(full\s*name|nama\s*lengkap|name)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.name, isFactual: true };
  }
  if (/\b(email|surel)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.email, isFactual: true };
  }
  if (/\b(phone|mobile|telepon|handphone|nomor\s*hp|wa|whatsapp)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.phone, isFactual: true };
  }
  if (/\b(expected\s*salary|gaji\s*diharapkan|desired\s*salary)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.expected_salary, isFactual: false };
  }
  if (/\b(years\s*of\s*experience|tahun\s*pengalaman)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.years_of_experience, isFactual: true };
  }
  if (/\b(notice\s*period|kapan\s*bisa\s*bergabung|availability)\b/i.test(q)) {
    return { question: questionText, answer: `${CANDIDATE_DEFAULTS.notice_period_days} Hari`, isFactual: false };
  }
  if (/\b(relocate|relokasi|pindah)\b/i.test(q)) {
    return { question: questionText, answer: CANDIDATE_DEFAULTS.willing_to_relocate ? "Ya" : "Tidak", isFactual: false };
  }

  return null;
}

/**
 * Evaluates the Decision Table rule according to Blueprint Section 4 & 18.
 */
export function evaluateModeDecision(params: {
  mode: AgentMode;
  job: JobPostData;
  customQuestions?: string[];
}): ModeDecision {
  const { mode, job, customQuestions = [] } = params;

  // Mode 1: Scout
  if (mode === "SCOUT") {
    return {
      action: "OBSERVE",
      requiresUserApproval: false,
      unresolvedQuestions: [],
      reason: "Mode Scout: Hanya memindai dan menganalisis lowongan tanpa melakukan apply.",
    };
  }

  // Check custom/screening questions
  const unresolved: string[] = [];
  for (const q of customQuestions) {
    const resolved = resolveScreeningQuestion(q);
    // If not factual or cannot be resolved, flag as needing review
    if (!resolved || !resolved.isFactual) {
      unresolved.push(q);
    }
  }

  if (unresolved.length > 0) {
    return {
      action: "NEED_REVIEW",
      requiresUserApproval: true,
      unresolvedQuestions: unresolved,
      reason: `Terdapat pertanyaan screening yang butuh keputusan Anda: ${unresolved.join(", ")}`,
    };
  }

  const score = job.match_score || 0;

  // Mode 3: Auto Apply Rules (Blueprint Section 4)
  if (mode === "AUTO") {
    const locLower = (job.location || "").toLowerCase();
    const locMatch = locLower.includes("remote") || locLower.includes("yogyakarta");
    const salaryMatch = !job.salary_min || job.salary_min >= 8000000;
    const catLower = (job.position || "").toLowerCase();
    const catMatch = catLower.includes("qa") || catLower.includes("quality assurance") || catLower.includes("system analyst");

    if (score >= 85.0 && locMatch && salaryMatch && catMatch && customQuestions.length === 0) {
      return {
        action: "AUTO_APPLY",
        requiresUserApproval: false,
        unresolvedQuestions: [],
        reason: "Semua kriteria auto-apply terpenuhi (Skor ≥ 85%, Lokasi, Gaji, dan tanpa pertanyaan kustom).",
      };
    }
  }

  // Mode 2: Assisted Apply (Recommended Default)
  return {
    action: "WAITING_APPROVAL",
    requiresUserApproval: true,
    unresolvedQuestions: [],
    reason: "Menunggu persetujuan pengguna sebelum mengirimkan lamaran.",
  };
}
