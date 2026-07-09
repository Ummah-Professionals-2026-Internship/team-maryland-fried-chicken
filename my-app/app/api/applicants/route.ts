import { NextResponse } from "next/server";
import { getAllApplicants } from "@/lib/applicantService";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

// GET /api/applicants
// Returns all applicants from the database as a JSON array
export async function GET() {
  const { data, error } = await getAllApplicants();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/applicants
// Stores one public applicant form submission in Supabase
export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 },
    );
  }

  const firstName = getString(body.firstName);
  const lastName = getString(body.lastName);
  const email = getString(body.email).toLowerCase();
  const phone = getString(body.phone);
  const gender = getString(body.gender);
  const university = getString(body.university);
  const major = getString(body.major);
  const academicStanding = getString(body.academicStanding);
  const desiredFutureCareer = getString(body.desiredFutureCareer);
  const industry = getString(body.industry);
  const services = getStringArray(body.services);
  const additionalNotes = getString(body.additionalNotes);

  const missingFields = [
    ["First Name", firstName],
    ["Last Name", lastName],
    ["Email", email],
    ["Phone Number", phone],
    ["Gender", gender],
    ["University", university],
    ["Major", major],
    ["Academic Standing", academicStanding],
    ["Desired Future Career", desiredFutureCareer],
    ["Industry", industry],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  if (services.length === 0) {
    missingFields.push("Service Type Requested");
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missingFields.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: existingApplicant, error: existingApplicantError } =
      await supabase
        .from("applicants")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (existingApplicantError) {
      return NextResponse.json(
        { error: existingApplicantError.message },
        { status: 500 },
      );
    }

    if (existingApplicant) {
      return NextResponse.json(
        { error: "An applicant submission with this email already exists." },
        { status: 409 },
      );
    }

    const selectedService = services[0];
    const { data: serviceType, error: serviceTypeError } = await supabase
      .from("service_types")
      .select("id")
      .eq("name", selectedService)
      .maybeSingle();

    if (serviceTypeError) {
      return NextResponse.json(
        { error: serviceTypeError.message },
        { status: 500 },
      );
    }

    if (!serviceType) {
      return NextResponse.json(
        { error: `Service type not found: ${selectedService}` },
        { status: 400 },
      );
    }

    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        gender,
        university,
        major,
        academic_standing: academicStanding,
        desired_future_career: desiredFutureCareer,
        industry,
        service_id: serviceType.id,
        additional_notes: additionalNotes || null,
        source: "Public Applicant Form",
      })
      .select("id")
      .single();

    if (applicantError) {
      return NextResponse.json(
        { error: applicantError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { applicantId: applicant.id, message: "Applicant submitted successfully." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while submitting applicant.",
      },
      { status: 500 },
    );
  }
}
