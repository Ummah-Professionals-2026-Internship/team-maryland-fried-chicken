"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { type Applicant } from "@/components/ui/applicant_table";

const fieldOrder = ["Technology", "Marketing", "Finance", "Healthcare", "Legal"];

// "Yusuf Ibrahim" -> "YI"
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getStatusStyles(status?: string) {
  if (status === "Matched") {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-amber-50 text-amber-700";
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-500 shrink-0"
      aria-hidden="true"
    >
      {isOpen ? <path d="m6 9 6 6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
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

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFields, setOpenFields] = useState<Record<string, boolean>>({
    Technology: true,
    Marketing: true,
    Finance: true,
    Healthcare: true,
    Legal: true,
  });

  async function fetchApplicants() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/applicants");

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      const data = await response.json();
      setApplicants(data.map(mapApplicant));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return applicants;
    }

    return applicants.filter((applicant) => {
      const searchableText = [
        applicant.name,
        applicant.desiredCareer,
        applicant.category,
        applicant.status,
        applicant.submitted,
        ...(applicant.services ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, applicants]);

  const groupedApplicants = fieldOrder
    .map((field) => ({
      field,
      applicants: filteredApplicants.filter(
        (applicant) => applicant.category === field
      ),
    }))
    .filter((group) => group.applicants.length > 0);

  function toggleField(field: string) {
    setOpenFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  return (
    <MainLayout>
      <section className="w-full max-w-[1100px] mx-auto space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="text-zinc-900"
              style={{ fontSize: "1.375rem", fontWeight: 700 }}
            >
              Applicant Submissions
            </h1>
            <p className="text-slate-600 text-sm mt-0.5">
              {loading
                ? "Loading..."
                : `${filteredApplicants.length} applicants across ${fieldOrder.length} fields`}
            </p>
          </div>

          <div className="w-full md:w-80">
            <label htmlFor="applicant-search" className="sr-only">
              Search applicants
            </label>
            <input
              id="applicant-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search applicants"
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading applicants...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchApplicants}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Applicants list */}
        {!loading && !error && (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs text-slate-600 uppercase tracking-wide font-medium">
              <div className="col-span-3">Applicant</div>
              <div className="col-span-3">Desired Career</div>
              <div className="col-span-2">Services</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-2">Status</div>
            </div>

            <div className="space-y-4">
              {groupedApplicants.map((group) => {
                const isOpen = openFields[group.field];

                return (
                  <div
                    key={group.field}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleField(group.field)}
                      className={`w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors ${
                        isOpen ? "border-b border-slate-200" : ""
                      }`}
                    >
                      <ChevronIcon isOpen={isOpen} />
                      <span className="text-zinc-900 text-sm font-semibold">
                        {group.field}
                      </span>
                      <span className="text-slate-600 text-xs ml-1">
                        ({group.applicants.length})
                      </span>
                    </button>

                    {isOpen && (
                      <div>
                        {group.applicants.map((applicant, index) => (
                          <Link
                            key={applicant.id}
                            href={`/applicants/${applicant.id}`}
                            className={`block cursor-pointer hover:bg-slate-50 transition-colors ${
                              index !== group.applicants.length - 1
                                ? "border-b border-slate-200"
                                : ""
                            }`}
                          >
                            <div className="md:hidden flex items-start justify-between gap-3 px-4 py-3.5">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#007CA6] text-xs shrink-0 mt-0.5 font-semibold">
                                  {getInitials(applicant.name)}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-zinc-900 text-sm truncate font-medium">
                                    {applicant.name}
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                    {applicant.desiredCareer ?? "—"}
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                    {applicant.submitted ?? "—"}
                                  </p>

                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {(applicant.services ?? []).slice(0, 2).map((service) => (
                                      <span
                                        key={service}
                                        className="text-xs bg-slate-100 text-[#007CA6] px-1.5 py-0.5 rounded"
                                      >
                                        {service}
                                      </span>
                                    ))}

                                    {(applicant.services ?? []).length > 2 && (
                                      <span className="text-xs text-slate-600">
                                        +{applicant.services!.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-xs px-2 py-0.5 rounded shrink-0 font-medium ${getStatusStyles(
                                  applicant.status
                                )}`}
                              >
                                {applicant.status ?? "Awaiting"}
                              </span>
                            </div>

                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3.5 items-center">
                              <div className="col-span-3 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#007CA6] text-xs shrink-0 font-semibold">
                                  {getInitials(applicant.name)}
                                </div>
                                <p className="text-zinc-900 text-sm truncate font-medium">
                                  {applicant.name}
                                </p>
                              </div>

                              <div className="col-span-3">
                                <p className="text-zinc-900 text-sm">
                                  {applicant.desiredCareer ?? "—"}
                                </p>
                                {applicant.yearsExp != null && (
                                  <p className="text-slate-600 text-xs">
                                    {applicant.yearsExp} yr exp
                                  </p>
                                )}
                              </div>

                              <div className="col-span-2 flex flex-wrap gap-1">
                                {(applicant.services ?? []).slice(0, 2).map((service) => (
                                  <span
                                    key={service}
                                    className="text-xs bg-slate-100 text-[#007CA6] px-1.5 py-0.5 rounded"
                                  >
                                    {service}
                                  </span>
                                ))}

                                {(applicant.services ?? []).length > 2 && (
                                  <span className="text-xs text-slate-600">
                                    +{applicant.services!.length - 2}
                                  </span>
                                )}
                              </div>

                              <div className="col-span-2">
                                <p className="text-zinc-900 text-sm">
                                  {applicant.submitted ?? "—"}
                                </p>
                              </div>

                              <div className="col-span-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusStyles(
                                    applicant.status
                                  )}`}
                                >
                                  {applicant.status ?? "Awaiting"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state */}
              {groupedApplicants.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  {searchQuery ? "No applicants match your search." : "No applicants found."}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}
