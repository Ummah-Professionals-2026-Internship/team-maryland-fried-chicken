import { NextResponse } from "next/server";
import { applicants } from "@/data/mockData";

// GET /api/applicants/:id
// Reads the dynamic [id] segment from the URL and returns the matching applicant
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  const applicant = applicants.find((a) => a.applicantId === id);

  if (!applicant) {
    return NextResponse.json(
      { error: `Applicant with id "${id}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(applicant);
}
