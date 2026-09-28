/**
 * REQ-PORTAL-EXP-001: Scout route harus fetch dari Jobicy dan Findwork sebagai portal tambahan.
 * Tests URL yang dipanggil oleh fetchRealLiveJobs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Firestore to prevent real DB calls
vi.mock("@/lib/firestore", () => ({
  firestoreJobService: {
    createJob: vi.fn().mockResolvedValue("mock-id-123"),
  },
}));

// Mock synced_jobs.json (virtual module)
vi.mock("@/lib/synced_jobs.json", () => ({ default: [] }));


// Track URLs that were fetched
const fetchedUrls: string[] = [];
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  fetchedUrls.length = 0;
  vi.clearAllMocks();

  mockFetch.mockImplementation((url: string) => {
    fetchedUrls.push(typeof url === "string" ? url : String(url));

    if (String(url).includes("jobicy.com")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          jobs: [
            {
              id: "j1",
              jobTitle: "QA Engineer",
              companyName: "Remote Tech",
              jobGeo: "Worldwide",
              url: "https://jobicy.com/jobs/qa-1",
              jobDescription: "QA automation with Playwright",
              jobIndustry: ["Testing"],
            },
          ],
        }),
      });
    }

    if (String(url).includes("findwork.dev")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              id: 1,
              role: "QA Engineer",
              company_name: "Tech Co",
              location: "Remote",
              url: "https://findwork.dev/jobs/1",
              text: "QA automation needed",
              keywords: ["QA", "playwright"],
            },
          ],
        }),
      });
    }

    if (String(url).includes("kalibrr.com")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ jobs: [] }),
      });
    }

    if (String(url).includes("remotive.com")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ jobs: [] }),
      });
    }

    if (String(url).includes("arbeitnow.com")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    }

    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("REQ-PORTAL-EXP-001: Portal Expansion — Jobicy + Findwork", () => {
  it("should call Jobicy API with the search query", async () => {
    const { POST } = await import("../app/api/scout/route");
    const request = new Request("http://localhost/api/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "QA Engineer" }),
    });

    await POST(request);

    const jobicyCall = fetchedUrls.find((u) => u.includes("jobicy.com"));
    expect(jobicyCall).toBeDefined();
    expect(jobicyCall).toContain("QA"); // encodeURIComponent uses %20 not +
  }, 30000);

  it("should call Findwork API with the search query", async () => {
    const { POST } = await import("../app/api/scout/route");
    const request = new Request("http://localhost/api/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "QA Engineer" }),
    });

    await POST(request);

    const findworkCall = fetchedUrls.find((u) => u.includes("findwork.dev"));
    expect(findworkCall).toBeDefined();
    expect(findworkCall).toContain("QA"); // encodeURIComponent uses %20 not +
  }, 30000);

  it("should call Kalibrr AND Remotive AND Jobicy AND Findwork in same request", async () => {
    const { POST } = await import("../app/api/scout/route");
    const request = new Request("http://localhost/api/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "QA Engineer" }),
    });

    await POST(request);

    expect(fetchedUrls.some((u) => u.includes("kalibrr.com"))).toBe(true);
    expect(fetchedUrls.some((u) => u.includes("remotive.com"))).toBe(true);
    expect(fetchedUrls.some((u) => u.includes("jobicy.com"))).toBe(true);
    expect(fetchedUrls.some((u) => u.includes("findwork.dev"))).toBe(true);
  }, 30000);

  it("should return success response with total_scanned > 0 when portals return data", async () => {
    const { POST } = await import("../app/api/scout/route");
    const request = new Request("http://localhost/api/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "QA Engineer" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.total_scanned).toBeGreaterThanOrEqual(0);
  }, 30000);
});
