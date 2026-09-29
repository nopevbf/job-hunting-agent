/**
 * TEST-LI-001 & TEST-LI-002: LinkedIn Job Search & Parsing Tests
 * SQA ISTQB: Equivalence Partitioning & Boundary Value Analysis for LinkedIn Guest Search
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clearMockStore } from "../lib/firestore";

// Mock sample HTML returned by LinkedIn guest search
const sampleLinkedInHtml = `
<ul class="jobs-search__results-list">
  <li>
    <div class="base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card">
      <a class="base-card__full-link absolute top-0 right-0 bottom-0 left-0 p-0 z-[2]" href="https://id.linkedin.com/jobs/view/quality-assurance-engineer-at-nawadata-4320101292?position=1&amp;pageNum=0">
        <span class="sr-only">Quality Assurance Engineer</span>
      </a>
      <div class="base-search-card__info">
        <h3 class="base-search-card__title">Quality Assurance Engineer</h3>
        <h4 class="base-search-card__subtitle">
          <a class="hidden-nested-link" href="https://id.linkedin.com/company/nawadata">NawaData</a>
        </h4>
        <div class="base-search-card__metadata">
          <span class="job-search-card__location">Jakarta, Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  </li>
  <li>
    <div class="base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card">
      <a class="base-card__full-link absolute top-0 right-0 bottom-0 left-0 p-0 z-[2]" href="https://id.linkedin.com/jobs/view/qa-engineer-at-bibit-4409276978?tracking=abc">
        <span class="sr-only">QA Engineer for Stockbit</span>
      </a>
      <div class="base-search-card__info">
        <h3 class="base-search-card__title">QA Engineer for Stockbit</h3>
        <h4 class="base-search-card__subtitle">Bibit.id</h4>
        <div class="base-search-card__metadata">
          <span class="job-search-card__location">Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  </li>
</ul>
`;

describe("REQ-LINKEDIN-001: LinkedIn Portal Search & HTML Card Parsing", () => {
  const fetchedUrls: string[] = [];
  const mockFetch = vi.fn();

  beforeEach(() => {
    clearMockStore();
    fetchedUrls.length = 0;
    vi.clearAllMocks();

    mockFetch.mockImplementation((url: string) => {
      const urlStr = String(url);
      fetchedUrls.push(urlStr);

      if (urlStr.includes("linkedin.com/jobs-guest")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLinkedInHtml),
          json: () => Promise.resolve({}),
        });
      }

      // Default mock for other portals
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({ jobs: [], results: [], data: [] }),
      });
    });

    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("TEST-LI-001: Scout stream should query LinkedIn guest API and emit linkedin events", async () => {
    const { GET } = await import("../app/api/scout/stream/route");
    const request = new Request("http://localhost/api/scout/stream?query=QA+Engineer") as Parameters<typeof GET>[0];

    const response = await GET(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Stream reader not available");

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

    // Verify LinkedIn API call was made
    const linkedInCall = fetchedUrls.find((u) => u.includes("linkedin.com/jobs-guest"));
    expect(linkedInCall).toBeDefined();
    expect(linkedInCall).toContain("QA");

    // Verify SSE emitted linkedin events
    expect(allText).toContain('"step":"linkedin"');
    expect(allText).toContain('"step":"linkedin_done"');
    expect(allText).toContain("LinkedIn");
  }, 30000);

  it("TEST-LI-002: LinkedIn jobs should be extracted with cleaned URL and correct company/title", async () => {
    const { GET } = await import("../app/api/scout/stream/route");
    const request = new Request("http://localhost/api/scout/stream?query=QA+Engineer") as Parameters<typeof GET>[0];

    const response = await GET(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Stream reader not available");

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

    // Verify extracted job data contains parsed values from sample HTML
    expect(allText).toContain("NawaData");
    expect(allText).toContain("Bibit.id");
    expect(allText).toContain("https://id.linkedin.com/jobs/view/quality-assurance-engineer-at-nawadata-4320101292");
  }, 30000);
});
