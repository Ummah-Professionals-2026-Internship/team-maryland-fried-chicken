import { NextResponse } from "next/server";
import { requireAdminOrStaff } from "@/lib/requireStaffRole";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/applicants/:id/resume
export async function GET(_request, { params }) {
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

  const { data: applicant, error: applicantError } =
    await authorization.admin
      .from("applicants")
      .select("resume_url")
      .eq("id", id)
      .maybeSingle();

  if (applicantError) {
    return NextResponse.json(
      { error: applicantError.message },
      { status: 500 },
    );
  }

  if (!applicant) {
    return NextResponse.json(
      { error: "Applicant not found." },
      { status: 404 },
    );
  }

  const resumePath =
    typeof applicant.resume_url === "string"
      ? applicant.resume_url.trim()
      : "";

  if (!resumePath) {
    return NextResponse.json(
      { error: "No resume is available for this applicant." },
      { status: 404 },
    );
  }

  // Preserve compatibility with any older records that stored a full URL.
  if (/^https?:\/\//i.test(resumePath)) {
    return NextResponse.redirect(resumePath);
  }

  const { data: resumeFile, error: downloadError } =
    await authorization.admin.storage
      .from("resumes")
      .download(resumePath);

  if (downloadError || !resumeFile) {
    return NextResponse.json(
      {
        error:
          downloadError?.message ??
          "The stored resume could not be downloaded.",
      },
      { status: 404 },
    );
  }

  const storedFileName =
    resumePath.split("/").pop() || "resume";

  const downloadFileName = storedFileName
    .replace(/^\d+-/, "")
    .replace(/["\\\r\n]/g, "_");

  return new NextResponse(resumeFile, {
    status: 200,
    headers: {
      "Content-Type":
        resumeFile.type || "application/octet-stream",
      "Content-Disposition":
        `attachment; filename="${downloadFileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}