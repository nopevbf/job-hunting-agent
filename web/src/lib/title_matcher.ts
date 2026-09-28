/**
 * Title relevance verification utility.
 * Ensures scraped or API jobs strictly match the user's searched role
 * and rejects irrelevant roles (e.g. Sales, Project Manager, Kitchen, Acquisition).
 */
export function isTitleRelevant(title: string, query: string): boolean {
  if (!title) return false;

  const titleLower = title.toLowerCase().trim();
  const queryLower = (query || "").toLowerCase().trim();

  // Explicit forbidden non-tech/non-relevant role keywords
  const explicitForbidden = [
    "acquisition", "representative", "interior", "kitchen",
    "supervisor", "recruiter", "frontliner", "teller", "tax intern",
    "account executive", "driver", "cleaner", "cook"
  ];
  for (const f of explicitForbidden) {
    // Only reject if it appears as a distinct word
    const regex = new RegExp(`\\b${f}\\b`, "i");
    if (regex.test(titleLower)) {
      return false;
    }
  }

  // 1. Direct query substring match
  if (queryLower && titleLower.includes(queryLower)) {
    return true;
  }

  // 2. Domain QA/Testing canonical synonyms
  const isQaQuery = /qa|quality|test|sdet/i.test(queryLower);
  if (isQaQuery) {
    // Distinct 'qa' word boundary
    if (/\bqa\b/i.test(titleLower)) {
      return true;
    }
    const qaSynonyms = [
      "quality assurance",
      "software tester",
      "software test",
      "test engineer",
      "test automation",
      "automation test",
      "automation engineer",
      "sdet",
      "sqa",
      "qc software",
      "software quality"
    ];
    if (qaSynonyms.some((s) => titleLower.includes(s))) {
      return true;
    }
  }

  // 3. Multi-token match for general queries
  const tokens = queryLower
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  if (tokens.length > 0 && tokens.every((t) => titleLower.includes(t))) {
    return true;
  }

  return false;
}
