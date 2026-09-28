import { NextResponse } from "next/server";
import { firestoreJobService } from "@/lib/firestore";
import { JobPostData, TailoredCVContent } from "@/lib/types";

// Master Profile for truth-preserving evaluation
const USER_PROFILE = {
  name: "Eka Pratama",
  title: "QA Engineer / System Analyst",
  skills: [
    "manual testing", "regression testing", "api testing", "functional testing",
    "playwright", "postman", "newman", "sql", "postgresql", "mysql", "python",
    "javascript", "jira", "gitlab", "swagger", "dbeaver"
  ],
  years_exp: 4,
  location: "yogyakarta",
  min_salary: 8000000
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, position, job_description, job_url, location } = body;

    if (!company || !position || !job_description) {
      return NextResponse.json(
        { success: false, error: "Company, position, and job_description are required" },
        { status: 400 }
      );
    }

    const jdLower = (job_description + " " + position).toLowerCase();

    // 1. Skill Extraction & Gap Analysis
    const knownSkills = [
      "Manual Testing", "API Testing", "Playwright", "Selenium", "Postman",
      "SQL", "Python", "JavaScript", "Cypress", "Docker", "CI/CD", "JMeter", "Regression Testing"
    ];
    const detectedReqs = knownSkills.filter((s) => jdLower.includes(s.toLowerCase()));

    const matchedSkills: string[] = [];
    const gaps: string[] = [];

    detectedReqs.forEach((req) => {
      const isKnown = USER_PROFILE.skills.some((us) => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us));
      if (isKnown) {
        matchedSkills.push(req);
      } else {
        gaps.push(req); // Never inject into resume! Flag as GAP
      }
    });

    // 2. Score Calculation (7 Dimensions)
    const skillRatio = detectedReqs.length > 0 ? matchedSkills.length / detectedReqs.length : 1.0;
    const skillScore = skillRatio * 35.0;

    const roleScore = jdLower.includes("qa") || jdLower.includes("quality assurance") || jdLower.includes("system analyst") ? 20.0 : 12.0;
    const expScore = 15.0;
    const locScore = (location || "").toLowerCase().includes("remote") || (location || "").toLowerCase().includes("yogyakarta") ? 10.0 : 7.0;
    const salaryScore = 10.0;
    const toolsScore = (matchedSkills.length / Math.max(1, detectedReqs.length)) * 10.0;

    const totalScore = Math.min(100.0, Math.max(0.0, Math.round((skillScore + roleScore + expScore + locScore + salaryScore + toolsScore) * 10) / 10));

    // 3. Truth-Preserving Tailored CV Content
    const tailoredCV: TailoredCVContent = {
      name: USER_PROFILE.name,
      title: USER_PROFILE.title,
      summary: `QA Engineer with 4+ years of experience in manual testing, API testing, and web automation with Playwright. Dedicated to high-standard quality engineering.`,
      skills: {
        "Prioritized Testing & Automation": matchedSkills,
        "Database & Dev": ["SQL", "Python", "JavaScript"],
      },
      experiences: [
        {
          company: "PT Solusi Teknologi Digital",
          role: "QA Engineer",
          location: "Yogyakarta",
          start_date: "2022-01",
          end_date: "Present",
          bullets: [
            "Conducted end-to-end browser regression automation using Playwright.",
            "Implemented API automated tests using Postman and Newman.",
          ],
        },
      ],
      matched_skills: matchedSkills,
      gaps: gaps,
    };

    const status = totalScore >= 80.0 ? "READY_TO_APPLY" : totalScore >= 60.0 ? "REVIEW" : "SKIPPED";

    const newJob: JobPostData = {
      source: "Manual Import / Web",
      company,
      position,
      location: location || "Remote",
      job_url: job_url || "https://example.com/imported-job",
      job_description,
      requirements: detectedReqs,
      match_score: totalScore,
      status,
      matched_skills: matchedSkills,
      gaps: gaps,
      tailored_cv: tailoredCV,
      discovered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const createdId = await firestoreJobService.createJob(newJob);
    if (!createdId) {
      return NextResponse.json({ success: false, error: "Duplicate job detected" }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      id: createdId,
      data: { ...newJob, id: createdId },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
