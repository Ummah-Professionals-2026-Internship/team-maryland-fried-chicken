import { NextResponse } from "next/server";
import { getApplicantById, updateApplicant } from "@/lib/applicantService";
import { requireAdminOrStaff } from "@/lib/requireStaffRole";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches the industry CHECK constraint on the applicants table (migrations/init.sql)
const ALLOWED_INDUSTRY = [
  "Business",
  "Education",
  "Engineering",
  "Finance",
  "Healthcare",
  "Information Technology",
  "Law",
  "Social Services",
  "Other",
];

// GET /api/applicants/:id
// Reads the dynamic [id] segment from the URL and returns the matching applicant
export async function GET(request, { params }) {
  // In Next.js 15+, params is a Promise — we await it to get the actual values
  const { id } = await params;

  // Reject non-UUID values before hitting the database
  if (!UUID_REGEX.test(id)) {
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

// PATCH /api/applicants/:id
// Updates editable applicant fields. Scoped to `industry` for now — advisors
// report it is frequently mis-filed and use it mainly as a grouping tool.
export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: `Applicant with id "${id}" not found` },
      { status: 404 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  const updates = {};

  if (body.industry !== undefined) {
    if (!ALLOWED_INDUSTRY.includes(body.industry)) {
      return NextResponse.json(
        { error: `industry must be one of: ${ALLOWED_INDUSTRY.join(", ")}` },
        { status: 400 }
      );
    }
    updates.industry = body.industry;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update. Expected industry." },
      { status: 400 }
    );
  }

  const { data, error } = await updateApplicant(id, updates);

  if (error) {
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

// DELETE /api/applicants/:id
export async function DELETE(_request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const authorization = await requireAdminOrStaff();

  if (authorization.error) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { data: applicant, error: lookupError } =
    await authorization.admin
      .from("applicants")
      .select("id, resume_url")
      .eq("id", id)
      .maybeSingle();

  if (lookupError) {
    return NextResponse.json(
      { error: lookupError.message },
      { status: 500 },
    );
  }

  if (!applicant) {
    return NextResponse.json(
      { error: "Applicant not found." },
      { status: 404 },
    );
  }

  const { error: deleteError } = await authorization.admin
    .from("applicants")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 },
    );
  }

  const resumePath =
    typeof applicant.resume_url === "string"
      ? applicant.resume_url.trim()
      : "";

  if (resumePath && !/^https?:\/\//i.test(resumePath)) {
    const { error: storageError } =
      await authorization.admin.storage
        .from("resumes")
        .remove([resumePath]);

    if (storageError) {
      console.error(
        "[DELETE /api/applicants/:id - Resume Cleanup Error]:",
        storageError,
      );
    }
  }

  return NextResponse.json({
    message: "Applicant deleted successfully.",
    deletedId: applicant.id,
  });
}