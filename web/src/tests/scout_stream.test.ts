/**
 * REQ-SCOUT-SSE-001: Scout stream endpoint harus mengirim Server-Sent Events
 * dengan log progress per portal saat pencarian berjalan.
 */

import { describe, it, expect, vi } from "vitest";

// Mock global fetch to prevent real network calls in SSE tests
vi.mock("global", () => ({}));

describe("REQ-SCOUT-SSE-001: Scout Stream SSE Endpoint", () => {
  it("should export a GET handler at /api/scout/stream", async () => {
    const mod = await import("../app/api/scout/stream/route");
    expect(mod.GET).toBeDefined();
    expect(typeof mod.GET).toBe("function");
  });

  it("GET handler should return a Response with text/event-stream content type", async () => {
    // Mock fetch to return empty portal responses quickly
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jobs: [], results: [], data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("../app/api/scout/stream/route");

    // Use plain Request (not NextRequest) — works in Vitest environment
    const request = new Request(
      "http://localhost/api/scout/stream?query=QA+Engineer"
    ) as Parameters<typeof GET>[0];

    const response = await GET(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");

    vi.unstubAllGlobals();
  }, 30000);

  it("SSE stream should emit start event and done event", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jobs: [], results: [], data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("../app/api/scout/stream/route");
    const request = new Request(
      "http://localhost/api/scout/stream?query=QA+Engineer"
    ) as Parameters<typeof GET>[0];

    const response = await GET(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Response body reader not available");

    let allText = "";
    let safety = 0;
    while (safety < 20) {
      safety++;
      const { done, value } = await reader.read();
      if (done) break;
      if (value) allText += decoder.decode(value);
      if (allText.includes('"done"')) break;
    }

    reader.cancel();
    vi.unstubAllGlobals();

    // Should contain the start event and done event
    expect(allText).toContain("data:");
    expect(allText).toContain('"step"');
    expect(allText).toContain('"message"');
    expect(allText).toContain('"done"');
  }, 60000);

  it("SSE stream should include 'kalibrr' and 'remotive' step events", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jobs: [], results: [], data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("../app/api/scout/stream/route");
    const request = new Request(
      "http://localhost/api/scout/stream?query=QA+Engineer"
    ) as Parameters<typeof GET>[0];

    const response = await GET(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Response body reader not available");

    let allText = "";
    let safety = 0;
    while (safety < 20) {
      safety++;
      const { done, value } = await reader.read();
      if (done) break;
      if (value) allText += decoder.decode(value);
      if (allText.includes('"done"')) break;
    }

    reader.cancel();
    vi.unstubAllGlobals();

    // Should have portal steps
    expect(allText).toContain("kalibrr");
    expect(allText).toContain("remotive");
    expect(allText).toContain("jobicy");
  }, 60000);

  it("SSE stream should filter, score, and save qualified jobs to Firestore, emitting jobs in done event", async () => {
    // Mock Kalibrr returning a real QA Engineer job
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("kalibrr.com")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jobs: [
              {
                id: "kalibrr-qa-1",
                name: "QA Automation Engineer",
                company: { name: "BCA Digital", code: "bca-digital" },
                google_location: { address_components: { city: "Jakarta" } },
                description: "Manual Testing, API Testing, Playwright, SQL required.",
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ jobs: [], results: [], data: [] }),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("../app/api/scout/stream/route");
    const request = new Request(
      "http://localhost/api/scout/stream?query=QA+Engineer"
    ) as Parameters<typeof GET>[0];

    const response = await GET(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Response body reader not available");

    let allText = "";
    let safety = 0;
    while (safety < 30) {
      safety++;
      const { done, value } = await reader.read();
      if (done) break;
      if (value) allText += decoder.decode(value);
      if (allText.includes('"done"')) break;
    }

    reader.cancel();
    vi.unstubAllGlobals();

    // Verify evaluating step and done event with qualified jobs
    expect(allText).toContain('"step":"evaluating"');
    expect(allText).toContain('"step":"done"');
    expect(allText).toContain('"qualified":1');
    expect(allText).toContain('"jobs"');
    expect(allText).toContain("QA Automation Engineer");
  }, 60000);
});

