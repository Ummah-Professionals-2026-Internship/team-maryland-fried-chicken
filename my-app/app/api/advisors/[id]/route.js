import { NextResponse } from "next/server";
import { getAdvisorById, updateAdvisor } from "@/lib/advisorService";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches the CHECK constraints on the advisors table (migrations/init.sql)
const ALLOWED_AVAILABILITY = ["Available", "Unavailable"];
const ALLOWED_RELIABILITY = ["High", "Medium", "Low"];

// GET /api/advisors/:id
// Reads the dynamic [id] segment from the URL and returns the matching advisor
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  // Reject non-UUID values before hitting the database
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: `Advisor with id "${id}" not found` },
      { status: 404 }
    );
  }

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

// PATCH /api/advisors/:id
// Updates an advisor's availability status and/or reliability level.
// Scoped to just these two fields for now (see issue: Advisor Profile Edit).
export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: `Advisor with id "${id}" not found` },
      { status: 404 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 },
    );
  }

  const updates = {};

  if (body.availability_status !== undefined) {
    if (!ALLOWED_AVAILABILITY.includes(body.availability_status)) {
      return NextResponse.json(
        {
          error: `availability_status must be one of: ${ALLOWED_AVAILABILITY.join(", ")}`,
        },
        { status: 400 },
      );
    }
    updates.availability_status = body.availability_status;
  }

  if (body.reliability_level !== undefined) {
    if (!ALLOWED_RELIABILITY.includes(body.reliability_level)) {
      return NextResponse.json(
        {
          error: `reliability_level must be one of: ${ALLOWED_RELIABILITY.join(", ")}`,
        },
        { status: 400 },
      );
    }
    updates.reliability_level = body.reliability_level;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update. Expected availability_status and/or reliability_level." },
      { status: 400 },
    );
  }

  const { data, error } = await updateAdvisor(id, updates);

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: `Advisor with id "${id}" not found` },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
