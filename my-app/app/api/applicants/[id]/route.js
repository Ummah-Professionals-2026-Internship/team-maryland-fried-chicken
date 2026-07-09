import { NextResponse } from "next/server";
import { getApplicantById } from "@/lib/applicantService";

// GET /api/applicants/:id
// Reads the dynamic [id] segment from the URL and returns the matching applicant
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  // Reject non-UUID values before hitting the database
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: `Applicant with id "${id}" not found` },
      { status: 404 }
    );
  }

  const { data, error } = await getApplicantById(id);

  if (error) {
    // Supabase returns a PGRST116 code when no row is found via .single()
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: `Applicant with id "${id}" not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
