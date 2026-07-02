import { NextResponse } from "next/server";
import { getAllApplicants } from "@/lib/applicantService";

// GET /api/applicants
// Returns all applicants from the database as a JSON array
export async function GET() {
  const { data, error } = await getAllApplicants();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
