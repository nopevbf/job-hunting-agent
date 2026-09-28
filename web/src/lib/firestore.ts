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

export function clearMockStore() {
  globalMockStore.clear();
}

// Seed synced data if available from Python agent (no dummy simulation data)
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
      }
    } catch {
      // Clean state: no dummy simulation data seeded
    }
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
