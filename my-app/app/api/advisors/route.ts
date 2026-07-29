import { NextResponse } from "next/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { getAllAdvisors } from "@/lib/advisorService";
import { createClient } from "@/utils/supabase/server";

type LookupRow = {
  id: string;
  name: string;
};

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

function normalizePhoneNumber(countryCode: string, value: string) {
  if (!/^\+\d{1,4}$/.test(countryCode)) return "";
  if (!/^\d+$/.test(value)) return "";

  return `${countryCode}${value}`;
}

function isValidLinkedInUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol === "https:" &&
      (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com"))
    );
  } catch {
    return false;
  }
}
function normalizeMentorshipExperience(value: string) {
  return value.replace(/\u2013/g, "-");
}

async function upsertLookupValues(
  supabase: SupabaseClient,
  tableName: "service_types" | "expertise_areas",
  values: string[],
) {
  const uniqueValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];

  if (uniqueValues.length === 0) return [] as LookupRow[];

  const { data, error } = await supabase
    .from(tableName)
    .upsert(
      uniqueValues.map((name) => ({ name })),
      { onConflict: "name" },
    )
    .select("id, name");

  if (error) throw error;

  return (data ?? []) as LookupRow[];
}

// GET /api/advisors
export async function GET() {
  const { data, error } = await getAllAdvisors();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/advisors
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

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email must be a valid email address." },
      { status: 400 },
    );
  }

  const countryCode = getString(body.countryCode);
  const phoneInput = getString(body.phone);
  const linkedinUrl = getString(body.linkedinUrl);

  if (phoneInput && !/^\d+$/.test(phoneInput)) {
    return NextResponse.json(
      {
        error:
          "Only enter digits. Do not include spaces, dashes, parentheses, or other characters.",
      },
      { status: 400 },
    );
  }

  if (!isValidLinkedInUrl(linkedinUrl)) {
    return NextResponse.json(
      {
        error:
          "LinkedIn URL must be a valid https://linkedin.com profile URL.",
      },
      { status: 400 },
    );
  }

  const phone = normalizePhoneNumber(countryCode, phoneInput);
  const gender = getString(body.gender);

  if (!["Brother", "Sister"].includes(gender)) {
    return NextResponse.json(
      { error: "Gender must be Brother or Sister." },
      { status: 400 },
    );
  }

  // Location fields updated from City to County
  const locationCounty = getString(body.location_county || body.county);
  const locationState = getString(body.location_state || body.state);

  const almaMaters = getStringArray(body.almaMaters);
  const majors = getStringArray(body.majors);
  const company = getString(body.company);
  const jobTitle = getString(body.jobTitle);
  const industry = getString(body.industry);
  const experienceLevel = getString(body.experienceLevel);
  const expertise = getStringArray(body.expertise);
  const services = [...new Set(getStringArray(body.services))];
  const careerHistorySummary = getString(body.careerHistorySummary);
  const uniqueCareerExperiences = [...new Set(getStringArray(body.uniqueCareerExperiences))];
  const mentorshipExperience = normalizeMentorshipExperience(
    getString(body.mentorshipExperience),
  );
  const additionalNotes = getString(body.additionalNotes);
  const maxMeetingsPerMonth = Number(getString(body.maxMeetingsPerMonth));

  const missingFields = [
    ["First Name", firstName],
    ["Last Name", lastName],
    ["Email", email],
    ["Phone Number", phone],
    ["Gender", gender],
    ["County", locationCounty],
    ["State", locationState],
    ["Company", company],
    ["Job Title", jobTitle],
    ["Industry", industry],
    ["Experience Level", experienceLevel],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  if (almaMaters.length === 0) missingFields.push("Alma Mater(s)");
  if (majors.length === 0) missingFields.push("Major(s)");
  if (services.length === 0) missingFields.push("Service Types");

  if (!Number.isInteger(maxMeetingsPerMonth) || maxMeetingsPerMonth < 1) {
    missingFields.push("Maximum Meetings Per Month");
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid required field(s): ${missingFields.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const supabase = createClient();

    const { data: advisor, error: advisorError } = await supabase
      .from("advisors")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        linkedin_url: linkedinUrl || null,
        gender,

        // Updated location column mapping
        location_county: locationCounty,
        location_state: locationState,

        alma_mater: almaMaters.join(", "),
        major: majors.join(", "),
        company,
        job_title: jobTitle,
        industry,
        experience_level: experienceLevel,
        reliability_level: "Medium",
        career_history_summary: careerHistorySummary || null,
        unique_career_experiences: uniqueCareerExperiences.length > 0 ? uniqueCareerExperiences : null,
        mentorship_experience: mentorshipExperience || null,
        max_meetings_per_month: maxMeetingsPerMonth,
        additional_notes: additionalNotes || null,
      })
      .select("id")
      .single();

    if (advisorError) {
      return NextResponse.json(
        { error: advisorError.message },
        { status: 500 },
      );
    }

    const serviceRows = await upsertLookupValues(
      supabase,
      "service_types",
      services,
    );

    if (serviceRows.length > 0) {
      const { error: advisorServicesError } = await supabase
        .from("advisor_services")
        .insert(
          serviceRows.map((service) => ({
            advisor_id: advisor.id,
            service_id: service.id,
          })),
        );

      if (advisorServicesError) {
        return NextResponse.json(
          { error: advisorServicesError.message },
          { status: 500 },
        );
      }
    }

    const expertiseRows = await upsertLookupValues(
      supabase,
      "expertise_areas",
      expertise,
    );

    if (expertiseRows.length > 0) {
      const { error: advisorExpertiseError } = await supabase
        .from("advisor_expertise")
        .insert(
          expertiseRows.map((area) => ({
            advisor_id: advisor.id,
            expertise_id: area.id,
          })),
        );

      if (advisorExpertiseError) {
        return NextResponse.json(
          { error: advisorExpertiseError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { advisorId: advisor.id, message: "Advisor submitted successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error("=== UNHANDLED POST /api/advisors EXCEPTION ===");
    console.error(error);
    console.error("=============================================");
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while submitting advisor.",
      },
      { status: 500 },
    );
  }
}