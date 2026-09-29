import { describe, it, expect, beforeEach } from "vitest";
import { FirestoreJobService, clearMockStore } from "../lib/firestore";
import { isTitleRelevant } from "../lib/title_matcher";
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

  it("REQ-REL-01: isTitleRelevant utility must match relevant QA roles and reject irrelevant roles", () => {
    expect(isTitleRelevant("Senior QA Automation Engineer", "QA Engineer")).toBe(true);
    expect(isTitleRelevant("Quality Assurance Specialist", "QA Engineer")).toBe(true);
    expect(isTitleRelevant("Software Tester", "QA Engineer")).toBe(true);
    expect(isTitleRelevant("SDET (Software Development Engineer in Test)", "QA Engineer")).toBe(true);

    // Reject irrelevant titles
    expect(isTitleRelevant("Conservation Acquisition Representative", "QA Engineer")).toBe(false);
    expect(isTitleRelevant("Interior Project Manager", "QA Engineer")).toBe(false);
    expect(isTitleRelevant("Course Consultant B2C Surabaya", "QA Engineer")).toBe(false);
    expect(isTitleRelevant("Wakil Head Kitchen", "QA Engineer")).toBe(false);
    expect(isTitleRelevant("Account Manager IT", "QA Engineer")).toBe(false);
  });

  it("REQ-REAL-04: Default FirestoreJobService without options must start with 0 jobs and NOT auto-seed dummy jobs", async () => {
    clearMockStore();
    const defaultService = new FirestoreJobService();
    const jobs = await defaultService.getJobs();
    expect(jobs.length).toBe(0);
    const companies = jobs.map((j) => j.company);
    expect(companies).not.toContain("Traveloka");
    expect(companies).not.toContain("PT BCA Digital");
    expect(companies).not.toContain("ABC Sales Agency");
  });

  it("REQ-REAL-05: synced_jobs.json must be empty or not contain old dummy simulation companies", () => {
    const syncedFile = path.resolve(__dirname, "../lib/synced_jobs.json");
    if (fs.existsSync(syncedFile)) {
      const content = fs.readFileSync(syncedFile, "utf-8");
      expect(content).not.toContain("ABC Sales Agency");
      expect(content).not.toContain("traveloka-qa-automation-101");
    }
  });
});

