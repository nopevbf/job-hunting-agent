export type ApplicationStatus =
  | "NEW"
  | "REVIEW"
  | "NEED_REVIEW"
  | "READY_TO_APPLY"
  | "APPLIED"
  | "INTERVIEW"
  | "REJECTED"
  | "OFFER"
  | "SKIPPED"
  | "CLOSED";

export interface TailoredCVContent {
  name: string;
  title: string;
  summary: string;
  skills: Record<string, string[]>;
  experiences: Array<{
    company: string;
    role: string;
    location: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }>;
  educations?: Array<{
    degree: string;
    institution: string;
    graduation_year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  matched_skills: string[];
  gaps: string[];
}

export interface JobPostData {
  id?: string;
  source: string;
  company: string;
  position: string;
  location: string;
  salary_min?: number | null;
  salary_max?: number | null;
  job_url: string;
  job_description: string;
  requirements?: string[];
  min_experience_years?: number | null;
  match_score?: number | null;
  status: ApplicationStatus;
  cv_file?: string | null;
  matched_skills?: string[];
  gaps?: string[];
  tailored_cv?: TailoredCVContent | null;
  discovered_at: string;
  applied_at?: string | null;
  updated_at: string;
}

export interface JobHuntingStats {
  found: number;
  unique: number;
  qualified: number;
  applied: number;
  waiting_approval: number;
  skipped: number;
  highest_match?: JobPostData | null;
}
