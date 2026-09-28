import { describe, it, expect } from "vitest";
import { evaluateModeDecision, AgentMode } from "../lib/decision_engine";
import { JobPostData } from "../lib/types";

describe("Mode Decision & Auto-Apply Rule Engine (ISTQB Decision Table)", () => {
  const baseJob: JobPostData = {
    source: "Glints",
    company: "Traveloka",
    position: "QA Automation Engineer",
    location: "Yogyakarta",
    salary_min: 12000000,
    salary_max: 18000000,
    job_url: "https://glints.com/jobs/1",
    job_description: "Automated testing with Playwright & Postman.",
    match_score: 90.0,
    status: "READY_TO_APPLY",
    discovered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("Case 1 (Scout Mode): Should never auto-apply, action is OBSERVE", () => {
    const decision = evaluateModeDecision({
      mode: "SCOUT",
      job: baseJob,
      customQuestions: [],
    });
    expect(decision.action).toBe("OBSERVE");
    expect(decision.requiresUserApproval).toBe(false);
  });

  it("Case 2 (Assisted Apply Mode): Action is WAITING_APPROVAL", () => {
    const decision = evaluateModeDecision({
      mode: "ASSISTED",
      job: baseJob,
      customQuestions: [],
    });
    expect(decision.action).toBe("WAITING_APPROVAL");
    expect(decision.requiresUserApproval).toBe(true);
  });

  it("Case 3 (Assisted Apply with Custom Question): Action is NEED_REVIEW", () => {
    const decision = evaluateModeDecision({
      mode: "ASSISTED",
      job: baseJob,
      customQuestions: ["Why do you want to join our company specifically?"],
    });
    expect(decision.action).toBe("NEED_REVIEW");
    expect(decision.unresolvedQuestions.length).toBe(1);
  });

  it("Case 4 (Auto Apply Mode with Score >= 85 and all criteria): Action is AUTO_APPLY", () => {
    const decision = evaluateModeDecision({
      mode: "AUTO",
      job: baseJob, // Score 90.0, Yogyakarta, 12jt, QA
      customQuestions: [],
    });
    expect(decision.action).toBe("AUTO_APPLY");
  });

  it("Case 5 (Auto Apply Mode with Custom Question): Forces NEED_REVIEW", () => {
    const decision = evaluateModeDecision({
      mode: "AUTO",
      job: baseJob,
      customQuestions: ["What is your notice period?"],
    });
    expect(decision.action).toBe("NEED_REVIEW");
  });
});
