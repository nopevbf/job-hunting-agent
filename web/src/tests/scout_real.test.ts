import { describe, it, expect, beforeEach } from "vitest";
import { FirestoreJobService, clearMockStore } from "../lib/firestore";
import * as fs from "fs";
import * as path from "path";

describe("Elimination of Simulation Data & Real Search Requirements", () => {
  beforeEach(() => {
    clearMockStore();
  });

  it("REQ-REAL-01: Firestore mock store must start clean (0 dummy jobs pre-seeded)", async () => {
    const service = new FirestoreJobService({ useMockStore: true });
    const jobs = await service.getJobs();
    expect(jobs).toEqual([]);
    expect(jobs.length).toBe(0);
  });

  it("REQ-REAL-02: firestore.ts must not contain hardcoded defaultJobs dummy list", () => {
    const firestoreFile = path.resolve(__dirname, "../lib/firestore.ts");
    const content = fs.readFileSync(firestoreFile, "utf-8");
    expect(content).not.toContain("defaultJobs: JobPostData[]");
    expect(content).not.toContain("traveloka-qa-automation-101");
  });

  it("REQ-REAL-03: scout route must not contain hardcoded portalFeeds dummy list", () => {
    const scoutFile = path.resolve(__dirname, "../app/api/scout/route.ts");
    const content = fs.readFileSync(scoutFile, "utf-8");
    expect(content).not.toContain("portalFeeds: Array");
    expect(content).not.toContain("Fintech Nusantara");
    expect(content).not.toContain("Mitra Sales Niaga");
  });
});
