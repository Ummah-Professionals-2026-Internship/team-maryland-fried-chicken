import { NextResponse } from "next/server";
import { applicants } from "@/data/mockData";

// GET /api/applicants
// Returns all applicants as a JSON array
export async function GET() {
  return NextResponse.json(applicants);
}
