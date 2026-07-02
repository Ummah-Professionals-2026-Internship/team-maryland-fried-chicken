import { NextResponse } from "next/server";
import { getAdvisorById } from "@/lib/advisorService";

// GET /api/advisors/:id
// Reads the dynamic [id] segment from the URL and returns the matching advisor
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  const { data, error } = await getAdvisorById(id);

  if (error) {
    // Supabase returns a PGRST116 code when no row is found via .single()
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: `Advisor with id "${id}" not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
