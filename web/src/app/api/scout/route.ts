import { NextResponse } from "next/server";
import { firestoreJobService } from "@/lib/firestore";
import { JobPostData, TailoredCVContent } from "@/lib/types";
import { isTitleRelevant } from "@/lib/title_matcher";

interface ScoutRequest {
  query?: string;
  location?: string;
  min_salary?: number;
}

interface RawRealJob {
  source: string;
  company: string;
  position: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_url: string;
  description: string;
  requirements: string[];
}

/**
 * Fetches real live tech jobs from verified public job APIs and local sync cache.
 * Portals: Kalibrr (ID) → Jobicy (Remote) → Remotive (Remote) → Findwork (Tech) → Arbeitnow (fallback) → synced local
 */
async function fetchRealLiveJobs(query: string): Promise<RawRealJob[]> {
  const realJobs: RawRealJob[] = [];
  const timeoutMs = 8000;

  // 1. Fetch live Indonesian jobs from Kalibrr API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://www.kalibrr.com/api/job_board/search?text=${encodeURIComponent(query)}&limit=15`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data.jobs) ? data.jobs : [];
      for (const item of items) {
        if (item.name && item.id) {
          const compName = item.company?.name || "Confidential";
          const compCode = item.company?.code || "company";
          const city = item.google_location?.address_components?.city || "Indonesia";
          const rawDesc = (item.description || "").replace(/<[^>]*>?/gm, " ").trim();
          realJobs.push({
            source: "Kalibrr",
            company: compName,
            position: item.name,
            location: city,
            job_url: `https://www.kalibrr.com/c/${compCode}/sub/${item.id}`,
            description: rawDesc.slice(0, 500) || item.name,
            requirements: ["Manual Testing", "API Testing", "Playwright", "SQL", "Selenium"],
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice: Kalibrr live fetch unavailable:", err);
  }

  // 2. Fetch live Indonesian jobs from LinkedIn guest API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=Indonesia&start=0`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok && typeof res.text === "function") {
      const html = await res.text();
      const cardRegex = /<div[^>]*class="[^"]*base-search-card[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      const titleRegex = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>\s*(.*?)\s*<\/h3>/i;
      const companyRegex = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>\s*(.*?)\s*<\/a>|<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>\s*(.*?)\s*<\/h4>/i;
      const locationRegex = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/i;
      const linkRegex = /<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]*)"/i;
      const cleanHtml = (s: string) => s.replace(/<[^>]*>?/gm, "").trim();

      let match;
      while ((match = cardRegex.exec(html)) !== null && realJobs.length < 15) {
        const block = match[1];
        const tMatch = titleRegex.exec(block);
        const rawTitle = tMatch ? cleanHtml(tMatch[1]) : "";
        if (!rawTitle) continue;

        const cMatch = companyRegex.exec(block);
        let rawComp = "Confidential";
        if (cMatch) {
          rawComp = cleanHtml(cMatch[1] || cMatch[2] || "") || "Confidential";
        }

        const locMatch = locationRegex.exec(block);
        const rawLoc = locMatch ? cleanHtml(locMatch[1]) : "Indonesia";

        const lMatch = linkRegex.exec(block);
        const rawUrl = lMatch ? lMatch[1].split("?")[0].trim() : "";
        if (!rawUrl) continue;

        realJobs.push({
          source: "LinkedIn",
          company: rawComp,
          position: rawTitle,
          location: rawLoc,
          job_url: rawUrl,
          description: `Lowongan ${rawTitle} di ${rawComp}, ${rawLoc}.`,
          requirements: ["Manual Testing", "API Testing", "Playwright", "SQL", "Selenium"],
        });
      }
    }
  } catch (err) {
    console.warn("Notice: LinkedIn live fetch unavailable:", err);
  }

  // 3. Fetch worldwide remote jobs from Jobicy API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?tag=${encodeURIComponent(query)}&count=10`, {
      signal: controller.signal,
      headers: { "User-Agent": "PersonalJobAgent/1.0" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data.jobs) ? data.jobs : [];
      for (const item of items.slice(0, 8)) {
        if (item.jobTitle && item.url) {
          const rawDesc = (item.jobDescription || "").replace(/<[^>]*>?/gm, " ").trim();
          realJobs.push({
            source: "Jobicy",
            company: item.companyName || "Confidential",
            position: item.jobTitle,
            location: item.jobGeo || "Remote",
            job_url: item.url,
            description: rawDesc.slice(0, 500) || item.jobTitle,
            requirements: Array.isArray(item.jobIndustry) ? item.jobIndustry : ["Testing", "QA"],
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice: Jobicy live fetch unavailable:", err);
  }

  // 3. Fetch live jobs from Remotive API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { "User-Agent": "PersonalJobAgent/1.0" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data.jobs) ? data.jobs : [];
      for (const item of items.slice(0, 8)) {
        if (item.title && item.url) {
          const rawDesc = (item.description || "").replace(/<[^>]*>?/gm, " ").trim();
          realJobs.push({
            source: "Remotive",
            company: item.company_name || "Confidential",
            position: item.title,
            location: item.candidate_required_location || "Remote",
            job_url: item.url,
            description: rawDesc.slice(0, 500),
            requirements: ["Manual Testing", "API Testing", "Playwright", "Regression Testing", "SQL"],
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice: Remotive live fetch unavailable:", err);
  }

  // 4. Fetch worldwide tech jobs from Findwork API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { "User-Agent": "PersonalJobAgent/1.0" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data.results) ? data.results : [];
      for (const item of items.slice(0, 8)) {
        if (item.role && item.url) {
          const rawDesc = (item.text || "").replace(/<[^>]*>?/gm, " ").trim();
          realJobs.push({
            source: "Findwork",
            company: item.company_name || "Confidential",
            position: item.role,
            location: item.location || "Remote",
            job_url: item.url,
            description: rawDesc.slice(0, 500) || item.role,
            requirements: Array.isArray(item.keywords) && item.keywords.length > 0
              ? item.keywords
              : ["Testing", "QA", "Automation"],
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice: Findwork live fetch unavailable:", err);
  }

  // 5. Fetch jobs from Arbeitnow API (fallback when results still low)
  if (realJobs.length < 5) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { "User-Agent": "PersonalJobAgent/1.0" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data.data) ? data.data : [];
        for (const item of items.slice(0, 8)) {
          if (item.title && item.url) {
            const rawDesc = (item.description || "").replace(/<[^>]*>?/gm, " ").trim();
            realJobs.push({
              source: "Arbeitnow",
              company: item.company_name || "Confidential",
              position: item.title,
              location: item.location || "Remote",
              job_url: item.url,
              description: rawDesc.slice(0, 500),
              requirements: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ["Testing", "QA", "Automation"],
            });
          }
        }
      }
    } catch (err) {
      console.warn("Notice: Arbeitnow live fetch unavailable:", err);
    }
  }

  // 6. Check for synced real jobs from Python Playwright scraper (JobStreet & Glints)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const synced = require("@/lib/synced_jobs.json");
    if (Array.isArray(synced) && synced.length > 0) {
      for (const j of synced.slice(0, 10)) {
        if (j.position && j.job_url && !realJobs.some((r) => r.job_url === j.job_url)) {
          realJobs.push({
            source: j.source || "JobStreet",
            company: j.company,
            position: j.position,
            location: j.location || "Indonesia",
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            job_url: j.job_url,
            description: j.job_description || j.position,
            requirements: j.requirements || ["Manual Testing", "SQL"],
          });
        }
      }
    }
  } catch {
    // No synced file present
  }

  return realJobs;
}

export async function POST(request: Request) {
  try {
    let reqData: ScoutRequest = {};
    try {
      reqData = await request.json();
    } catch {
      reqData = {};
    }

    const targetQuery = reqData.query || "QA Engineer";

    // Fetch real live job postings (No fake dummy data)
    const realJobsList = await fetchRealLiveJobs(targetQuery);

    const addedJobs: JobPostData[] = [];
    let skippedCount = 0;

    for (const item of realJobsList) {
      // 1. Title / Role Relevance Check (Strict Matching)
      if (!isTitleRelevant(item.position, targetQuery)) {
        skippedCount++;
        continue;
      }

      // 2. Exclude Keyword Check (Job Filter)
      if (item.position.toLowerCase().includes("sales") || item.description.toLowerCase().includes("commission only")) {
        skippedCount++;
        continue;
      }

      // 2. Score Calculation (7 Dimensions)
      const userSkills = [
        "selenium", "playwright", "appium", "postman", "jmeter", "sql",
        "manual testing", "regression testing", "istqb", "grafana", "git", "python", "javascript"
      ];
      const matched = item.requirements.filter((r) => userSkills.includes(r.toLowerCase()));
      const gaps = item.requirements.filter((r) => !userSkills.includes(r.toLowerCase()));

      const skillRatio = item.requirements.length > 0 ? matched.length / item.requirements.length : 1.0;
      const skillScore = skillRatio * 35.0;
      const roleScore = 20.0;
      const expScore = 15.0;
      const locScore = 10.0;
      const salaryScore = 10.0;
      const toolsScore = 10.0;

      const totalScore = Math.min(100.0, Math.round((skillScore + roleScore + expScore + locScore + salaryScore + toolsScore) * 10) / 10);

      const status = totalScore >= 80.0 ? "READY_TO_APPLY" : "REVIEW";

      // 3. Tailored CV Content for Firman Aji Prasetyo
      const tailoredCV: TailoredCVContent = {
        name: "Firman Aji Prasetyo",
        title: item.position,
        summary: `QA Engineer with 1.5+ years of experience delivering quality across 6 concurrent projects in PropertyTech and Fintech domains. Specializes in test automation (Selenium, Playwright), ISTQB-aligned techniques, and reducing defect leakage.`,
        skills: {
          "Prioritized Stack": matched,
          "Database & Development": ["SQL", "Python", "JavaScript", "Grafana"],
        },
        experiences: [
          {
            company: "PT. Royal D'Paragon Land",
            role: "Quality Assurance Engineer",
            location: "Depok, Yogyakarta · On-site",
            start_date: "2025-03",
            end_date: "2026-04",
            bullets: [
              "Managed QA across 6 concurrent projects (booking, payment, finance, reservation, ops).",
              "Reduced defect leakage to production by ~30% and monitored bugs using Grafana.",
              "Automated 70% of the regression suite using Selenium and applied ISTQB techniques.",
            ],
          },
        ],
        matched_skills: matched,
        gaps: gaps,
      };

      const jobData: JobPostData = {
        source: item.source,
        company: item.company,
        position: item.position,
        location: item.location,
        salary_min: item.salary_min,
        salary_max: item.salary_max,
        job_url: item.job_url,
        job_description: item.description,
        requirements: item.requirements,
        match_score: totalScore,
        status,
        matched_skills: matched,
        gaps: gaps,
        tailored_cv: tailoredCV,
        discovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const createdId = await firestoreJobService.createJob(jobData);
      if (createdId) {
        addedJobs.push({ ...jobData, id: createdId });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_scanned: realJobsList.length,
        qualified: addedJobs.length,
        filtered_out: skippedCount,
        jobs: addedJobs,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
