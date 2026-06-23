import { NextResponse } from "next/server";
import { advisors } from "@/data/mockData";

// GET /api/advisors
// Returns all advisors as a JSON array
export async function GET() {
  return NextResponse.json(advisors);
}
