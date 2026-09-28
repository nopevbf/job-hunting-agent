import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import { JobPostData, JobHuntingStats, ApplicationStatus } from "./types";

// In-memory mock store for local development without Firebase credentials
const globalMockStore: Map<string, JobPostData> = new Map();

// Seed initial realistic data for immediate UI rendering
export function seedMockStoreIfNeeded() {
  if (globalMockStore.size === 0) {
    // Try loading synced_jobs.json if available from Python agent
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const synced = require("./synced_jobs.json");
      if (Array.isArray(synced) && synced.length > 0) {
        synced.forEach((j: JobPostData) => {
          const id = j.id ? String(j.id) : `job-${Date.now()}`;
          globalMockStore.set(id, { ...j, id });
        });
        return;
      }
    } catch {
      // fallback to hardcoded default jobs
    }

    const defaultJobs: JobPostData[] = [
      {
        id: "job-1",
        source: "Glints",
        company: "Traveloka",
        position: "QA Automation Engineer",
        location: "Yogyakarta",
        salary_min: 12000000,
        salary_max: 18000000,
        job_url: "https://glints.com/id/opportunities/jobs/traveloka-qa-automation-101",
        job_description: "Looking for experienced QA Engineer with Manual Testing, API Testing, Postman, SQL, and Playwright.",
        requirements: ["Manual Testing", "API Testing", "Playwright", "Postman", "SQL"],
        min_experience_years: 3,
        match_score: 100.0,
        status: "READY_TO_APPLY",
        matched_skills: ["Manual Testing", "API Testing", "Playwright", "Postman", "SQL"],
        gaps: [],
        tailored_cv: {
          name: "Eka Pratama",
          title: "QA Engineer / System Analyst",
          summary: "QA Engineer with 4+ years of experience in manual testing, API testing, and web automation with Playwright.",
          skills: {
            "Testing": ["Manual Testing", "API Testing", "Regression Testing"],
            "Automation": ["Playwright", "Postman"],
            "Database": ["SQL", "PostgreSQL"],
          },
          experiences: [
            {
              company: "PT Solusi Teknologi Digital",
              role: "QA Engineer",
              location: "Yogyakarta",
              start_date: "2022-01",
              end_date: "Present",
              bullets: [
                "Conducted end-to-end browser regression automation using Playwright, reducing release regression testing time by 40%.",
                "Implemented API automated tests using Postman and Newman, integrating into CI/CD pipeline.",
              ],
            },
          ],
          matched_skills: ["API Testing", "Playwright", "Manual Testing", "SQL"],
          gaps: [],
        },
        discovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "job-2",
        source: "JobStreet",
        company: "PT BCA Digital",
        position: "System Analyst / QA Lead",
        location: "Remote",
        salary_min: 14000000,
        salary_max: 20000000,
        job_url: "https://www.jobstreet.co.id/job/bca-qa-sysanalyst-202",
        job_description: "Requires strong SQL data validation, API integration testing, Postman, JIRA, and Regression Testing.",
        requirements: ["SQL", "API Testing", "Manual Testing", "JIRA"],
        min_experience_years: 4,
        match_score: 96.7,
        status: "READY_TO_APPLY",
        matched_skills: ["SQL", "API Testing", "Manual Testing"],
        gaps: ["Cypress"],
        discovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "job-3",
        source: "Glints",
        company: "ABC Sales Agency",
        position: "Sales & QA Agent",
        location: "Yogyakarta",
        salary_min: 4000000,
        salary_max: 4000000,
        job_url: "https://glints.com/id/opportunities/jobs/sales-agency-303",
        job_description: "Commission Only sales and basic QA check.",
        match_score: 35.0,
        status: "SKIPPED",
        gaps: ["Commission Only Excluded"],
        discovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    defaultJobs.forEach((j) => globalMockStore.set(j.id!, j));
  }
}

export class FirestoreJobService {
  private useMock: boolean;
  private localStore: Map<string, JobPostData>;

  constructor(options?: { useMockStore?: boolean }) {
    const db = getFirestoreDb();
    this.useMock = options?.useMockStore ?? (db === null);
    this.localStore = options?.useMockStore ? new Map() : globalMockStore;
    if (this.useMock && !options?.useMockStore) {
      seedMockStoreIfNeeded();
    }
  }

  async getJobs(): Promise<JobPostData[]> {
    const db = getFirestoreDb();
    if (!this.useMock && db) {
      try {
        const q = query(collection(db, "jobs"), orderBy("updated_at", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as JobPostData));
      } catch (err) {
        console.warn("Firestore fetch failed, falling back to mock store:", err);
      }
    }
    return Array.from(this.localStore.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  async getJobById(id: string): Promise<JobPostData | null> {
    const db = getFirestoreDb();
    if (!this.useMock && db) {
      try {
        const docRef = doc(db, "jobs", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as JobPostData;
        }
        return null;
      } catch (err) {
        console.warn("Firestore getDoc failed, falling back to mock store:", err);
      }
    }
    return this.localStore.get(id) || null;
  }

  async createJob(job: JobPostData): Promise<string | null> {
    // 1. Duplicate Check (company + position + url)
    const existing = await this.getJobs();
    const isDup = existing.some(
      (j) =>
        j.company.toLowerCase().trim() === job.company.toLowerCase().trim() &&
        j.position.toLowerCase().trim() === job.position.toLowerCase().trim() &&
        j.job_url.trim() === job.job_url.trim()
    );
    if (isDup) {
      return null;
    }

    const newId = job.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newJob: JobPostData = {
      ...job,
      id: newId,
      discovered_at: job.discovered_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getFirestoreDb();
    if (!this.useMock && db) {
      try {
        const docRef = doc(db, "jobs", newId);
        await setDoc(docRef, newJob);
        return newId;
      } catch (err) {
        console.warn("Firestore setDoc failed, saving to local store:", err);
      }
    }

    this.localStore.set(newId, newJob);
    return newId;
  }

  async updateJobStatus(id: string, status: ApplicationStatus): Promise<boolean> {
    const now = new Date().toISOString();
    const updates: Partial<JobPostData> = {
      status,
      updated_at: now,
    };
    if (status === "APPLIED") {
      updates.applied_at = now;
    }

    const db = getFirestoreDb();
    if (!this.useMock && db) {
      try {
        const docRef = doc(db, "jobs", id);
        await updateDoc(docRef, updates);
        return true;
      } catch (err) {
        console.warn("Firestore updateDoc failed, falling back to mock store:", err);
      }
    }

    const existing = this.localStore.get(id);
    if (!existing) return false;
    this.localStore.set(id, { ...existing, ...updates });
    return true;
  }

  async getStats(): Promise<JobHuntingStats> {
    const jobs = await this.getJobs();
    let qualified = 0;
    let applied = 0;
    let waitingApproval = 0;
    let skipped = 0;
    let highest: JobPostData | null = null;

    for (const job of jobs) {
      if (job.status === "APPLIED") applied++;
      if (job.status === "READY_TO_APPLY" || job.status === "NEED_REVIEW") waitingApproval++;
      if (job.status === "SKIPPED") skipped++;
      if ((job.match_score || 0) >= 70.0) qualified++;

      if (!highest || (job.match_score || 0) > (highest.match_score || 0)) {
        highest = job;
      }
    }

    return {
      found: jobs.length,
      unique: jobs.length,
      qualified,
      applied,
      waiting_approval: waitingApproval,
      skipped,
      highest_match: highest,
    };
  }
}

export const firestoreJobService = new FirestoreJobService();
