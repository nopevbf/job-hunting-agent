import { describe, it, expect, beforeEach } from "vitest";
import { FirestoreJobService, clearMockStore } from "../lib/firestore";
import { JobPostData } from "../lib/types";

describe("FirestoreJobService", () => {
  let service: FirestoreJobService;

  const mockJob: JobPostData = {
    source: "Glints",
    company: "Traveloka",
    position: "QA Automation Engineer",
    location: "Yogyakarta",
    salary_min: 12000000,
    salary_max: 18000000,
    job_url: "https://glints.com/id/opportunities/jobs/traveloka-qa-1",
    job_description: "Automated testing with Playwright & Postman.",
    requirements: ["Playwright", "Postman", "API Testing"],
    match_score: 95.0,
    status: "READY_TO_APPLY",
    discovered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset service with clean mock store
    clearMockStore();
    service = new FirestoreJobService({ useMockStore: true });
  });

  it("should create and retrieve a job successfully", async () => {
    const createdId = await service.createJob(mockJob);
    expect(createdId).toBeTruthy();

    const retrieved = await service.getJobById(createdId!);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.company).toBe("Traveloka");
    expect(retrieved?.status).toBe("READY_TO_APPLY");
    expect(retrieved?.match_score).toBe(95.0);
  });

  it("should protect against duplicate jobs with identical company + position + url", async () => {
    const id1 = await service.createJob(mockJob);
    expect(id1).toBeTruthy();

    // Re-creating identical job should return null or existing ID without duplicating
    const id2 = await service.createJob(mockJob);
    expect(id2).toBeNull();

    const allJobs = await service.getJobs();
    expect(allJobs.length).toBe(1);
  });

  it("should perform state transition: READY_TO_APPLY -> APPLIED", async () => {
    const id = await service.createJob(mockJob);
    expect(id).toBeTruthy();

    const success = await service.updateJobStatus(id!, "APPLIED");
    expect(success).toBe(true);

    const updated = await service.getJobById(id!);
    expect(updated?.status).toBe("APPLIED");
    expect(updated?.applied_at).toBeTruthy();
  });

  it("should calculate correct Bento aggregated statistics", async () => {
    await service.createJob(mockJob); // READY_TO_APPLY (Score 95)
    await service.createJob({
      ...mockJob,
      company: "BCA",
      position: "System Analyst",
      job_url: "https://example.com/bca",
      match_score: 85.0,
      status: "APPLIED",
    });
    await service.createJob({
      ...mockJob,
      company: "Sales Agency",
      position: "Sales Agent",
      job_url: "https://example.com/sales",
      match_score: 40.0,
      status: "SKIPPED",
    });

    const stats = await service.getStats();
    expect(stats.found).toBe(3);
    expect(stats.unique).toBe(3);
    expect(stats.qualified).toBe(2);
    expect(stats.waiting_approval).toBe(1);
    expect(stats.applied).toBe(1);
    expect(stats.skipped).toBe(1);
    expect(stats.highest_match?.company).toBe("Traveloka");
  });

  it("DEL-FN-001 & DEL-FN-002: should delete a single job by id and return false for non-existent id", async () => {
    const id = await service.createJob(mockJob);
    expect(id).toBeTruthy();

    // Verify it exists
    let jobs = await service.getJobs();
    expect(jobs.length).toBe(1);

    // Delete existing job
    const success = await service.deleteJob(id!);
    expect(success).toBe(true);

    // Verify it is gone
    jobs = await service.getJobs();
    expect(jobs.length).toBe(0);

    const retrieved = await service.getJobById(id!);
    expect(retrieved).toBeNull();

    // DEL-FN-002: Deleting non-existent id should return false
    const failDelete = await service.deleteJob("non-existent-id-999");
    expect(failDelete).toBe(false);
  });

  it("DEL-FN-003 & DEL-FN-004: should clear all jobs from database", async () => {
    await service.createJob(mockJob);
    await service.createJob({
      ...mockJob,
      company: "Company 2",
      position: "QA Tester",
      job_url: "https://example.com/job-2",
    });

    let jobs = await service.getJobs();
    expect(jobs.length).toBe(2);

    // DEL-FN-003: Delete all
    const deletedCount = await service.deleteAllJobs();
    expect(deletedCount).toBe(2);

    jobs = await service.getJobs();
    expect(jobs.length).toBe(0);

    // DEL-FN-004: Delete all when already empty should return 0
    const secondDelete = await service.deleteAllJobs();
    expect(secondDelete).toBe(0);
  });
});
