import { describe, it, expect } from "vitest";
import { FirestoreJobService } from "../lib/firestore";
import { JobPostData } from "../lib/types";

describe("Bento Stats Calculation & BVA", () => {
  it("should handle empty database gracefully", async () => {
    const service = new FirestoreJobService({ useMockStore: true });
    const stats = await service.getStats();

    expect(stats.found).toBe(0);
    expect(stats.qualified).toBe(0);
    expect(stats.applied).toBe(0);
    expect(stats.waiting_approval).toBe(0);
    expect(stats.highest_match).toBeNull();
  });

  it("should apply BVA on Qualified threshold: 70.0 is qualified, 69.9 is not", async () => {
    const service = new FirestoreJobService({ useMockStore: true });

    const baseJob: JobPostData = {
      source: "Glints",
      company: "Company A",
      position: "QA",
      location: "Yogyakarta",
      job_url: "https://example.com/a",
      job_description: "test",
      status: "NEW",
      match_score: 70.0,
      discovered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await service.createJob(baseJob);
    await service.createJob({
      ...baseJob,
      company: "Company B",
      job_url: "https://example.com/b",
      match_score: 69.9,
    });

    const stats = await service.getStats();
    expect(stats.found).toBe(2);
    expect(stats.qualified).toBe(1); // Only 70.0 counts as qualified
    expect(stats.highest_match?.match_score).toBe(70.0);
  });
});
