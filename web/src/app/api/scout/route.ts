import { NextResponse } from "next/server";
import { firestoreJobService } from "@/lib/firestore";
import { JobPostData, TailoredCVContent } from "@/lib/types";
import { generateTailoredCoverLetter } from "@/lib/cover_letter";

interface ScoutRequest {
  query?: string;
  location?: string;
  min_salary?: number;
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

    // Multi-Portal Feed Simulation / Discovery Engine (Glints, JobStreet, Dealls)
    const portalFeeds: Array<{
      source: string;
      company: string;
      position: string;
      location: string;
      salary_min: number;
      salary_max: number;
      job_url: string;
      description: string;
      requirements: string[];
    }> = [
      {
        source: "Glints",
        company: "Traveloka",
        position: `${targetQuery} Automation`,
        location: "Yogyakarta, Indonesia",
        salary_min: 12000000,
        salary_max: 18000000,
        job_url: `https://glints.com/id/opportunities/jobs/traveloka-${Date.now().toString(36)}`,
        description: "We are seeking a QA Engineer with experience in API testing, Playwright, SQL, and Postman to ensure payment gateway reliability.",
        requirements: ["Playwright", "API Testing", "Postman", "SQL", "Manual Testing"],
      },
      {
        source: "JobStreet",
        company: "PT BCA Digital",
        position: `Senior ${targetQuery} / System Analyst`,
        location: "Remote",
        salary_min: 15000000,
        salary_max: 22000000,
        job_url: `https://www.jobstreet.co.id/job/bca-${Date.now().toString(36)}`,
        description: "Dibutuhkan Senior QA Engineer untuk memimpin pengujian regresi web, database validation menggunakan SQL, dan automasi API.",
        requirements: ["SQL", "API Testing", "Playwright", "Manual Testing", "Regression Testing"],
      },
      {
        source: "Dealls",
        company: "Fintech Nusantara",
        position: `QA Lead & Test Engineer`,
        location: "Yogyakarta",
        salary_min: 13000000,
        salary_max: 19000000,
        job_url: `https://dealls.com/jobs/fintech-${Date.now().toString(36)}`,
        description: "Looking for test engineers to scale automated regression testing with Playwright and CI/CD pipelines.",
        requirements: ["Playwright", "API Testing", "SQL", "CI/CD"],
      },
      {
        source: "Glints",
        company: "Mitra Sales Niaga",
        position: "Sales Representative & Junior Tester",
        location: "Yogyakarta",
        salary_min: 4000000,
        salary_max: 5000000,
        job_url: `https://glints.com/id/opportunities/jobs/sales-${Date.now().toString(36)}`,
        description: "Commission Only sales job with minor app testing duties.",
        requirements: ["Sales", "Commission Only"],
      },
    ];

    const addedJobs: JobPostData[] = [];
    let skippedCount = 0;

    for (const item of portalFeeds) {
      // 1. Exclude Keyword Check (Job Filter)
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

      // 3. Tailored CV Content
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
        total_scanned: portalFeeds.length,
        qualified: addedJobs.length,
        filtered_out: skippedCount,
        jobs: addedJobs,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
