import { NextResponse } from "next/server";
import { getAllApplicants } from "@/lib/applicantService";
import {
  createAdminClient,
  createPublicClient,
} from "@/utils/supabase/server";

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

function normalizePhoneNumber(countryCode: string, value: string) {
  if (!/^\+\d{1,4}$/.test(countryCode)) return "";
  if (!/^\d+$/.test(value)) return "";

  return `${countryCode}${value}`;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const RESUME_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getResumeExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getSafeResumeFileName(fileName: string) {
  const extension = getResumeExtension(fileName);
  const baseName = fileName
    .slice(0, -(extension.length + 1))
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${baseName || "resume"}.${extension}`;
}

function validateResume(file: File) {
  const extension = getResumeExtension(file.name);
  const expectedContentType = RESUME_CONTENT_TYPES[extension];

  if (!expectedContentType) {
    return "Resume must be a PDF, DOC, or DOCX file.";
  }

  if (file.size > MAX_RESUME_BYTES) {
    return "Resume must be 5 MB or smaller.";
  }

  if (
    file.type &&
    file.type !== expectedContentType &&
    !(
      extension === "doc" &&
      file.type === "application/octet-stream"
    )
  ) {
    return "Resume file type does not match its extension.";
  }

  return null;
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
  let resumeFile: File | null = null;

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {};

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          body[key] = value;
        }
      }

      body.services = formData
        .getAll("services")
        .filter((value): value is string => typeof value === "string");

      const uploadedResume = formData.get("resume");

      if (
        uploadedResume instanceof File &&
        uploadedResume.size > 0
      ) {
        resumeFile = uploadedResume;
      }
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }
  } catch (err) {
    console.error(
      "[POST /api/applicants - Request Parsing Error]:",
      err,
    );

    return NextResponse.json(
      { error: "Invalid applicant submission." },
      { status: 400 },
    );
  }

  if (resumeFile) {
    const resumeValidationError = validateResume(resumeFile);

    if (resumeValidationError) {
      return NextResponse.json(
        { error: resumeValidationError },
        { status: 400 },
      );
    }
  }

  const firstName = getString(body.firstName);
  const lastName = getString(body.lastName);
  const email = getString(body.email).toLowerCase();
  const countryCode = getString(body.countryCode);
  const phoneInput = getString(body.phone);

  if (phoneInput && !/^\d+$/.test(phoneInput)) {
    return NextResponse.json(
      {
        error:
          "Only enter digits. Do not include spaces, dashes, parentheses, or other characters.",
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
  const services = [...new Set(getStringArray(body.services))];

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
    const supabase = createPublicClient();
    const admin = createAdminClient();

    const { data: serviceTypes, error: serviceTypeError } = await supabase
      .from("service_types")
      .select("id, name")
      .in("name", services);

    if (serviceTypeError) {
      console.error(
        "[POST /api/applicants - Service Type Lookup Error]:",
        serviceTypeError,
      );
      return NextResponse.json(
        { error: serviceTypeError.message },
        { status: 500 },
      );
    }

    const serviceRows = serviceTypes ?? [];
    const foundServiceNames = new Set(
      serviceRows.map((service) => service.name),
    );
    const missingServices = services.filter(
      (service) => !foundServiceNames.has(service),
    );

    if (missingServices.length > 0) {
      return NextResponse.json(
        {
          error: `Service type(s) not found: ${missingServices.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const primaryService = serviceRows.find(
      (service) => service.name === services[0],
    );

    if (!primaryService) {
      return NextResponse.json(
        { error: "Unable to determine the primary service type." },
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
          service_id: primaryService.id,
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

    let uploadedResumePath: string | null = null;

    if (resumeFile) {
      const safeFileName = getSafeResumeFileName(resumeFile.name);
      uploadedResumePath =
        `${applicant.id}/${Date.now()}-${safeFileName}`;

      const extension = getResumeExtension(resumeFile.name);
      const contentType =
        resumeFile.type ||
        RESUME_CONTENT_TYPES[extension] ||
        "application/octet-stream";

      const { error: uploadError } = await admin.storage
        .from("resumes")
        .upload(uploadedResumePath, resumeFile, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        await admin
          .from("applicants")
          .delete()
          .eq("id", applicant.id);

        console.error(
          "[POST /api/applicants - Resume Upload Error]:",
          uploadError,
        );

        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 },
        );
      }

      const { error: resumeUrlError } = await admin
        .from("applicants")
        .update({ resume_url: uploadedResumePath })
        .eq("id", applicant.id);

      if (resumeUrlError) {
        await admin.storage
          .from("resumes")
          .remove([uploadedResumePath]);

        await admin
          .from("applicants")
          .delete()
          .eq("id", applicant.id);

        console.error(
          "[POST /api/applicants - Resume URL Error]:",
          resumeUrlError,
        );

        return NextResponse.json(
          { error: resumeUrlError.message },
          { status: 500 },
        );
      }
    }

    const { error: applicantServicesError } = await admin
      .from("applicant_services")
      .insert(
        serviceRows.map((service) => ({
          applicant_id: applicant.id,
          service_id: service.id,
        })),
      );

    if (applicantServicesError) {
      if (uploadedResumePath) {
        await admin.storage
          .from("resumes")
          .remove([uploadedResumePath]);
      }

      await admin
        .from("applicants")
        .delete()
        .eq("id", applicant.id);

      console.error(
        "[POST /api/applicants - Applicant Services Insert Error]:",
        applicantServicesError,
      );

      return NextResponse.json(
        { error: applicantServicesError.message },
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
