import { NextResponse } from "next/server";
import { firestoreJobService } from "@/lib/firestore";
import { JobPostData } from "@/lib/types";

export async function GET() {
  try {
    const jobs = await firestoreJobService.getJobs();
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: JobPostData = await request.json();
    if (!body.company || !body.position || !body.job_url) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: company, position, job_url" },
        { status: 400 }
      );
    }
    const newId = await firestoreJobService.createJob(body);
    if (!newId) {
      return NextResponse.json(
        { success: false, error: "Duplicate job detected" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
