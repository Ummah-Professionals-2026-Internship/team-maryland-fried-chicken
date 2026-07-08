"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { type Applicant } from "@/components/ui/applicant_table";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Maps a raw Supabase applicant row to the Applicant UI type
function mapApplicant(raw: Record<string, unknown>): Applicant {
  return {
    id: String(raw.id ?? ""),
    name: [raw.first_name, raw.last_name].filter(Boolean).join(" ") || String(raw.name ?? ""),
    category: String(raw.industry ?? raw.category ?? ""),
    desiredCareer: String(raw.desired_future_career ?? raw.desiredCareer ?? ""),
    yearsExp: typeof raw.yearsExp === "number" ? raw.yearsExp : undefined,
    services: Array.isArray(raw.services) ? raw.services : undefined,
    submitted: raw.submission_date
      ? String(raw.submission_date).split("T")[0]
      : String(raw.submitted ?? ""),
    status: String(raw.status ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone_number ?? raw.phone ?? ""),
    careerGoal: String(raw.desired_future_career ?? raw.careerGoal ?? ""),
    industryInterest: String(raw.industry ?? raw.industryInterest ?? ""),
    education: String(raw.academic_standing ?? raw.education ?? ""),
    skills: Array.isArray(raw.skills) ? raw.skills : [],
  };
}

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplicant() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await fetch(`/api/applicants/${id}`);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Server error: ${response.status}`);
        }

        const data = await response.json();
        setApplicant(mapApplicant(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchApplicant();
  }, [id]);

  return (
    <MainLayout>
      <Link
        href="/applicants"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative -top-px shrink-0"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to Submissions
      </Link>

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading applicant...
        </div>
      )}

      {/* 404 state */}
      {!loading && notFound && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-zinc-900 font-semibold text-lg">Applicant not found</p>
          <p className="text-slate-500 text-sm mt-1">
            No applicant exists with this ID.
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Applicant profile */}
      {!loading && !notFound && !error && applicant && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-lg font-semibold">
                    {initials(applicant.name)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting Match
                  </span>
                </div>

                <h1 className="mt-4 text-xl font-bold text-zinc-900">
                  {applicant.name}
                </h1>
                <p className="text-zinc-600">{applicant.desiredCareer}</p>

                {applicant.email && (
                  <p className="mt-2 text-sm text-zinc-500">{applicant.email}</p>
                )}
                {applicant.phone && (
                  <p className="text-sm text-zinc-500">{applicant.phone}</p>
                )}
              </CardContent>
            </Card>

            {/* Career Details card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6">
                <h2 className="font-semibold text-zinc-900">Career Details</h2>

                <div className="mt-4 space-y-4 text-sm">
                  <Detail label="Career Goal" value={applicant.careerGoal} />
                  <Detail
                    label="Industry Interest"
                    value={applicant.industryInterest}
                  />
                  <Detail label="Education" value={applicant.education} />
                  <Detail
                    label="Experience"
                    value={
                      applicant.yearsExp != null
                        ? `${applicant.yearsExp} years`
                        : undefined
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services & Skills card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-zinc-500">Requested Services</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(applicant.services ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(applicant.skills ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {applicant.submitted && (
                  <p className="text-xs text-zinc-400">
                    Submitted: {applicant.submitted}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recommendations header card */}
            <Card className="border-zinc-200">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Advisor Recommendations
                  </h2>
                  <p className="text-sm text-zinc-500">
                    No recommendations generated yet.
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#2F7FA8] px-6 py-3 text-base font-medium text-white hover:bg-[#286E92]">
                  <Sparkles className="h-5 w-5" />
                  Generate Recommendations
                </button>
              </CardContent>
            </Card>

            {/* Empty state card */}
            <Card className="border-zinc-200">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Sparkles className="h-8 w-8 text-zinc-700" />
                <p className="mt-4 text-sm bg-zinc-50">
                  Click &quot;Generate Recommendations&quot; to find the best
                  advisor matches for this applicant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// Small helper for the career detail rows
function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <p className="text-zinc-900">{value ?? "—"}</p>
    </div>
  );
}
