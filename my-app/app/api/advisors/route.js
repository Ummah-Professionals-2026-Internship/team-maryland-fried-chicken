import { NextResponse } from "next/server";
import { getAllAdvisors } from "@/lib/advisorService";

// GET /api/advisors
// Returns all advisors from the database as a JSON array
export async function GET() {
  const { data, error } = await getAllAdvisors();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
