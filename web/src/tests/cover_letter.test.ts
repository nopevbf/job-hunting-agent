import { describe, it, expect } from "vitest";
import { generateTailoredCoverLetter } from "../lib/cover_letter";
import { JobPostData } from "../lib/types";

describe("Cover Letter Generator (Truth-Preserving & Bilingual)", () => {
  const baseJob: JobPostData = {
    source: "Glints",
    company: "Traveloka",
    position: "QA Automation Engineer",
    location: "Yogyakarta",
    job_url: "https://glints.com/jobs/1",
    job_description: "We are seeking a QA Engineer with experience in API testing, Playwright, SQL, and Cypress.",
    requirements: ["API Testing", "Playwright", "SQL", "Cypress"],
    matched_skills: ["API Testing", "Playwright", "SQL"],
    gaps: ["Cypress"],
    status: "READY_TO_APPLY",
    discovered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("should generate an English cover letter when JD is in English", () => {
    const letter = generateTailoredCoverLetter(baseJob);

    expect(letter).toContain("Dear Hiring Team at Traveloka");
    expect(letter).toContain("QA Automation Engineer");
    expect(letter).toContain("Playwright");
    expect(letter).toContain("API Testing");
    expect(letter).toContain("SQL");

    // Zero-hallucination rule: gap skill 'Cypress' must NOT be claimed as an expertise
    expect(letter.toLowerCase()).not.toContain("expert in cypress");
    expect(letter.toLowerCase()).not.toContain("proficient in cypress");
  });

  it("should generate an Indonesian cover letter when JD is in Indonesian", () => {
    const indoJob: JobPostData = {
      ...baseJob,
      company: "PT BCA Digital",
      position: "Quality Assurance Specialist",
      job_description: "Kami mencari tenaga QA profesional yang menguasai Manual Testing, SQL, dan API Testing untuk penempatan di Yogyakarta.",
      requirements: ["Manual Testing", "SQL", "API Testing"],
      matched_skills: ["Manual Testing", "SQL", "API Testing"],
      gaps: [],
    };

    const letter = generateTailoredCoverLetter(indoJob);

    expect(letter).toContain("Yth. Tim Rekrutmen PT BCA Digital");
    expect(letter).toContain("Quality Assurance Specialist");
    expect(letter).toContain("Manual Testing");
    expect(letter).toContain("SQL");
    expect(letter).toContain("Hormat saya");
  });
});
