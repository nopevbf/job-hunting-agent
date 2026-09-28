import { NextRequest } from "next/server";

interface ScoutLogEvent {
  step: string;
  message: string;
  count?: number;
  total?: number;
  qualified?: number;
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

      // --- Portal 2: Jobicy (Worldwide Remote) ---
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

      emit({
        step: "done",
        message: `✅ Selesai! ${allJobs.length} lowongan ditemukan dari semua portal.`,
        total: allJobs.length,
        qualified: allJobs.length,
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
