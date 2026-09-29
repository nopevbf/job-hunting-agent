import { NextRequest } from "next/server";
import { firestoreJobService } from "@/lib/firestore";
import { JobPostData, TailoredCVContent } from "@/lib/types";
import { isTitleRelevant } from "@/lib/title_matcher";

interface ScoutLogEvent {
  step: string;
  message: string;
  count?: number;
  total?: number;
  qualified?: number;
  jobs?: JobPostData[];
}

interface RawJob {
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

/** Emit one SSE data frame */
function sseEvent(event: ScoutLogEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

/** Fetch jobs from one portal — catches all errors gracefully */
async function fetchPortal(
  url: string,
  headers: Record<string, string>,
  normalize: (data: unknown) => RawJob[],
  timeoutMs = 8000
): Promise<RawJob[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return normalize(data);
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

const STRIP_HTML = (s: string) => (s || "").replace(/<[^>]*>?/gm, " ").trim();
const UA = "PersonalJobAgent/1.0";

/** Fetch real jobs from LinkedIn public guest API and parse HTML cards */
export async function fetchLinkedInJobs(query: string, timeoutMs = 8000): Promise<RawJob[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const jobs: RawJob[] = [];

  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=Indonesia&start=0`;
    const res = await fetch(url, {
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
      const titleRegex = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h3>/i;
      const companyRegex = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*<\/a>|<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h4>/i;
      const locationRegex = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/i;
      const linkRegex = /<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]*)"/i;
      const cleanHtml = (s: string) => s.replace(/<[^>]*>?/gm, "").trim();

      let match;
      while ((match = cardRegex.exec(html)) !== null && jobs.length < 10) {
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

        jobs.push({
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
  } finally {
    clearTimeout(timeoutId);
  }

  return jobs;
}

/**
 * GET /api/scout/stream?query=QA+Engineer
 * Streams Server-Sent Events with live progress while scraping job portals.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "QA Engineer";

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ScoutLogEvent) => {
        try {
          controller.enqueue(sseEvent(event));
        } catch {
          // Stream may already be closed
        }
      };

      emit({ step: "start", message: `🔍 Memulai pencarian untuk: "${query}"...` });

      const allJobs: RawJob[] = [];
      const seen = new Set<string>();

      const addJobs = (jobs: RawJob[]) => {
        for (const j of jobs) {
          if (!seen.has(j.job_url)) {
            seen.add(j.job_url);
            allJobs.push(j);
          }
        }
      };

      // --- Portal 1: Kalibrr (Indonesia) ---
      emit({ step: "kalibrr", message: "🇮🇩 Mencari di Kalibrr (Indonesia)...", count: allJobs.length });
      const kalibrrJobs = await fetchPortal(
        `https://www.kalibrr.com/api/job_board/search?text=${encodeURIComponent(query)}&limit=15`,
        {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        (data: unknown) => {
          const d = data as { jobs?: unknown[] };
          return (d.jobs || []).filter((i: unknown) => {
            const item = i as { name?: string; id?: string };
            return item.name && item.id;
          }).map((i: unknown) => {
            const item = i as {
              name: string; id: string;
              company?: { name?: string; code?: string };
              google_location?: { address_components?: { city?: string } };
              description?: string;
            };
            return {
              source: "Kalibrr",
              company: item.company?.name || "Confidential",
              position: item.name,
              location: item.google_location?.address_components?.city || "Indonesia",
              job_url: `https://www.kalibrr.com/c/${item.company?.code || "company"}/sub/${item.id}`,
              description: STRIP_HTML(item.description || "").slice(0, 500) || item.name,
              requirements: ["Manual Testing", "API Testing", "Playwright", "SQL", "Selenium"],
            };
          });
        }
      );
      addJobs(kalibrrJobs);
      emit({ step: "kalibrr_done", message: `✅ Kalibrr: ${kalibrrJobs.length} lowongan ditemukan`, count: allJobs.length });

      // --- Portal 2: LinkedIn (Indonesia Guest API) ---
      emit({ step: "linkedin", message: "💼 Mencari di LinkedIn (Indonesia)...", count: allJobs.length });
      const linkedInJobs = await fetchLinkedInJobs(query);
      addJobs(linkedInJobs);
      emit({ step: "linkedin_done", message: `✅ LinkedIn: ${linkedInJobs.length} lowongan ditemukan`, count: allJobs.length });

      // --- Portal 3: Jobicy (Worldwide Remote) ---
      emit({ step: "jobicy", message: "🌐 Mencari di Jobicy (Worldwide Remote)...", count: allJobs.length });
      const jobicyJobs = await fetchPortal(
        `https://jobicy.com/api/v2/remote-jobs?tag=${encodeURIComponent(query)}&count=10`,
        { "User-Agent": UA },
        (data: unknown) => {
          const d = data as { jobs?: unknown[] };
          return (d.jobs || []).filter((i: unknown) => {
            const item = i as { jobTitle?: string; url?: string };
            return item.jobTitle && item.url;
          }).slice(0, 8).map((i: unknown) => {
            const item = i as {
              jobTitle: string; url: string;
              companyName?: string; jobGeo?: string;
              jobDescription?: string; jobIndustry?: string[];
            };
            return {
              source: "Jobicy",
              company: item.companyName || "Confidential",
              position: item.jobTitle,
              location: item.jobGeo || "Remote",
              job_url: item.url,
              description: STRIP_HTML(item.jobDescription || "").slice(0, 500) || item.jobTitle,
              requirements: Array.isArray(item.jobIndustry) ? item.jobIndustry : ["Testing", "QA"],
            };
          });
        }
      );
      addJobs(jobicyJobs);
      emit({ step: "jobicy_done", message: `✅ Jobicy: ${jobicyJobs.length} lowongan ditemukan`, count: allJobs.length });

      // --- Portal 3: Remotive (Worldwide Remote) ---
      emit({ step: "remotive", message: "🌍 Mencari di Remotive (Worldwide Remote)...", count: allJobs.length });
      const remotiveJobs = await fetchPortal(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`,
        { "User-Agent": UA },
        (data: unknown) => {
          const d = data as { jobs?: unknown[] };
          return (d.jobs || []).filter((i: unknown) => {
            const item = i as { title?: string; url?: string };
            return item.title && item.url;
          }).slice(0, 8).map((i: unknown) => {
            const item = i as {
              title: string; url: string;
              company_name?: string; candidate_required_location?: string; description?: string;
            };
            return {
              source: "Remotive",
              company: item.company_name || "Confidential",
              position: item.title,
              location: item.candidate_required_location || "Remote",
              job_url: item.url,
              description: STRIP_HTML(item.description || "").slice(0, 500),
              requirements: ["Manual Testing", "API Testing", "Playwright", "Regression Testing", "SQL"],
            };
          });
        }
      );
      addJobs(remotiveJobs);
      emit({ step: "remotive_done", message: `✅ Remotive: ${remotiveJobs.length} lowongan ditemukan`, count: allJobs.length });

      // --- Portal 4: Findwork (Worldwide Tech) ---
      emit({ step: "findwork", message: "💻 Mencari di Findwork (Worldwide Tech)...", count: allJobs.length });
      const findworkJobs = await fetchPortal(
        `https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}`,
        { "User-Agent": UA },
        (data: unknown) => {
          const d = data as { results?: unknown[] };
          return (d.results || []).filter((i: unknown) => {
            const item = i as { role?: string; url?: string };
            return item.role && item.url;
          }).slice(0, 8).map((i: unknown) => {
            const item = i as {
              role: string; url: string;
              company_name?: string; location?: string; text?: string; keywords?: string[];
            };
            return {
              source: "Findwork",
              company: item.company_name || "Confidential",
              position: item.role,
              location: item.location || "Remote",
              job_url: item.url,
              description: STRIP_HTML(item.text || "").slice(0, 500) || item.role,
              requirements: Array.isArray(item.keywords) && item.keywords.length > 0
                ? item.keywords
                : ["Testing", "QA", "Automation"],
            };
          });
        }
      );
      addJobs(findworkJobs);
      emit({ step: "findwork_done", message: `✅ Findwork: ${findworkJobs.length} lowongan ditemukan`, count: allJobs.length });

      // --- Portal 5: Arbeitnow (fallback) ---
      if (allJobs.length < 5) {
        emit({ step: "arbeitnow", message: "🔄 Mencari di Arbeitnow (fallback)...", count: allJobs.length });
        const arbeitnowJobs = await fetchPortal(
          `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`,
          { "User-Agent": UA },
          (data: unknown) => {
            const d = data as { data?: unknown[] };
            return (d.data || []).filter((i: unknown) => {
              const item = i as { title?: string; url?: string };
              return item.title && item.url;
            }).slice(0, 8).map((i: unknown) => {
              const item = i as {
                title: string; url: string;
                company_name?: string; location?: string; description?: string; tags?: string[];
              };
              return {
                source: "Arbeitnow",
                company: item.company_name || "Confidential",
                position: item.title,
                location: item.location || "Remote",
                job_url: item.url,
                description: STRIP_HTML(item.description || "").slice(0, 500),
                requirements: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ["Testing", "QA", "Automation"],
              };
            });
          }
        );
        addJobs(arbeitnowJobs);
        emit({ step: "arbeitnow_done", message: `✅ Arbeitnow: ${arbeitnowJobs.length} lowongan ditemukan`, count: allJobs.length });
      }

      // --- Portal 6: Synced local jobs from Python scraper (JobStreet & Glints) ---
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const synced = require("@/lib/synced_jobs.json");
        if (Array.isArray(synced) && synced.length > 0) {
          const syncedItems: RawJob[] = [];
          for (const j of synced.slice(0, 10)) {
            if (j.position && j.job_url && !seen.has(j.job_url)) {
              syncedItems.push({
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
          if (syncedItems.length > 0) {
            addJobs(syncedItems);
            emit({
              step: "synced_done",
              message: `📂 JobStreet/Glints (Lokal): ${syncedItems.length} lowongan tersinkronisasi`,
              count: allJobs.length,
            });
          }
        }
      } catch {
        // No synced file present
      }

      // --- Evaluasi Kualifikasi & Simpan ke Database (Firestore) ---
      emit({
        step: "evaluating",
        message: `⚙️ Mengevaluasi ${allJobs.length} lowongan, menghitung skor kecocokan & tailoring CV...`,
        count: allJobs.length,
      });

      const addedJobs: JobPostData[] = [];
      let skippedCount = 0;

      for (const item of allJobs) {
        // 1. Title / Role Relevance Check (Strict Matching)
        if (!isTitleRelevant(item.position, query)) {
          skippedCount++;
          continue;
        }

        // 2. Exclude Keyword Check (Job Filter)
        if (
          item.position.toLowerCase().includes("sales") ||
          item.description.toLowerCase().includes("commission only")
        ) {
          skippedCount++;
          continue;
        }

        // 3. Score Calculation (7 Dimensions)
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

        // 4. Tailored CV Content for Firman Aji Prasetyo
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

        try {
          const createdId = await firestoreJobService.createJob(jobData);
          if (createdId) {
            addedJobs.push({ ...jobData, id: createdId });
          }
        } catch (saveErr) {
          console.warn("Notice: Failed saving job to firestore:", saveErr);
        }
      }

      emit({
        step: "done",
        message: `✅ Selesai! Memindai ${allJobs.length} lowongan, ${addedJobs.length} lolos kualifikasi & tersimpan di Daftar Peluang.`,
        total: allJobs.length,
        qualified: addedJobs.length,
        jobs: addedJobs,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
