import { NextResponse } from "next/server";
import { advisors } from "@/data/mockData";

// GET /api/advisors/:id
// Reads the dynamic [id] segment from the URL and returns the matching advisor
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  const advisor = advisors.find((a) => a.advisorId === id);

  if (!advisor) {
    return NextResponse.json(
      { error: `Advisor with id "${id}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(advisor);
}
