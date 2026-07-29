import { NextResponse } from "next/server";
import { getAllApplicants } from "@/lib/applicantService";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_REFERRAL_SOURCES = [
  "Word of Mouth",
  "Instagram",
  "LinkedIn",
  "My MSA",
  "My YM",
] as const;

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (normalized.length !== 10) return "";

  return `+1 (${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

// GET /api/applicants
export async function GET() {
  const { data, error } = await getAllApplicants();

  if (error) {
    console.error("[GET /api/applicants Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/applicants
export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch (err) {
    console.error("[POST /api/applicants - JSON Parsing Error]:", err);
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 },
    );
  }

  const firstName = getString(body.firstName);
  const lastName = getString(body.lastName);
  const email = getString(body.email).toLowerCase();
  const phone = formatPhoneNumber(getString(body.phone));
  const gender = getString(body.gender);

  if (!["Brother", "Sister"].includes(gender)) {
    return NextResponse.json(
      { error: "Gender must be Brother or Sister." },
      { status: 400 },
    );
  }

  // Location fields
  const locationCounty = getString(
    body.location_county || body.county,
  );
  const locationState = getString(
    body.location_state || body.state,
  );

  const university = getString(body.university);
  const major = getString(body.major);
  const academicStanding = getString(body.academicStanding);
  const desiredFutureCareer = getString(body.desiredFutureCareer);
  const industry = getString(body.industry);
  const services = getStringArray(body.services);

  // Optional string fields defaulting to empty strings or "Other"
  const additionalNotes = getString(body.additionalNotes);
  const source = getString(body.source || body.referralSource) || "Other";

  // Strict route-level check for the source column
  const isPredefinedSource = ALLOWED_REFERRAL_SOURCES.includes(
    source as (typeof ALLOWED_REFERRAL_SOURCES)[number],
  );
  const isValidCustomSource = source.trim().length > 0;

  if (!isPredefinedSource && !isValidCustomSource) {
    return NextResponse.json(
      { error: "Invalid referral source value provided." },
      { status: 400 },
    );
  }

  const missingFields = [
    ["First Name", firstName],
    ["Last Name", lastName],
    ["Email", email],
    ["Phone Number", phone],
    ["Gender", gender],
    ["County", locationCounty],
    ["State", locationState],
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
    const supabase = createClient();

    const selectedService = services[0];

    // Fetch service type lookup ID
    const { data: serviceType, error: serviceTypeError } =
      await supabase
        .from("service_types")
        .select("id")
        .eq("name", selectedService)
        .maybeSingle();

    if (serviceTypeError) {
      console.error("[POST /api/applicants - Service Type Lookup Error]:", serviceTypeError);
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

    // Insert applicant record
    const { data: applicant, error: applicantError } =
      await supabase
        .from("applicants")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phone,
          gender,

          // Location columns
          location_county: locationCounty,
          location_state: locationState,

          university,
          major,
          academic_standing: academicStanding,
          desired_future_career: desiredFutureCareer,
          industry,
          service_id: serviceType.id,
          additional_notes: additionalNotes,
          source,
        })
        .select("id")
        .single();

    if (applicantError) {
      console.error("[POST /api/applicants - Insert Applicant Error]:", applicantError);
      return NextResponse.json(
        { error: applicantError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        applicantId: applicant.id,
        message: "Applicant submitted successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    // Detailed server console log to catch any unhandled runtime exceptions
    console.error("=== UNHANDLED POST /api/applicants EXCEPTION ===");
    console.error(error);
    console.error("================================================");

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