"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { type Advisor } from "@/data/advisors";


function getReliabilityStyles(level: string) {
  if (level === "High") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (level === "Medium") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-red-50 text-red-700";
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

// Maps a raw Supabase advisor row to the Advisor UI type
function mapAdvisor(raw: Record<string, unknown>): Advisor {
  const firstName = String(raw.first_name ?? "");
  const lastName = String(raw.last_name ?? "");
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || String(raw.name ?? "");
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Supabase industry values differ from UI field labels — map them across
  const industryMap: Record<string, string> = {
    "Information Technology": "Technology",
    "Business": "Marketing",
    "Finance": "Finance",
    "Healthcare": "Healthcare",
    "Law": "Legal",
    "Education": "Education",
    "Engineering": "Engineering",
    "Social Services": "Social Services",
    "Other": "Other",
  };

  const rawIndustry = String(raw.industry ?? raw.field ?? "");
  const field = industryMap[rawIndustry] ?? rawIndustry;

  const city = String(raw.location_city ?? "");
  const state = String(raw.location_state ?? "");
  const location = [city, state].filter(Boolean).join(", ") || String(raw.location ?? "");

  return {
    id: String(raw.id ?? ""),
    initials,
    name: fullName,
    role: String(raw.job_title ?? raw.role ?? ""),
    jobTitle: String(raw.job_title ?? raw.jobTitle ?? ""),
    industry: rawIndustry,
    field,
    company: String(raw.company ?? ""),
    location,
    availability: String(raw.availability_status ?? raw.availability ?? ""),
    serviceTypes: Array.isArray(raw.serviceTypes) ? raw.serviceTypes : [],
    reliabilityLevel: (raw.reliability_level ?? raw.reliabilityLevel ?? "Medium") as Advisor["reliabilityLevel"],
    specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
    careerPrepDefault: Boolean(raw.careerPrepDefault ?? false),
    monthlyCapacityUsed: Number(raw.monthlyCapacityUsed ?? 0),
    monthlyCapacityTotal: Number(raw.max_meetings_per_month ?? raw.monthlyCapacityTotal ?? 0),
    lastEvent: String(raw.lastEvent ?? "—"),
    lastCareerPrep: String(raw.lastCareerPrep ?? "—"),
    signUpDate: raw.created_at
      ? String(raw.created_at).split("T")[0]
      : String(raw.signUpDate ?? ""),
    experienceLevel: String(raw.experience_level ?? raw.experienceLevel ?? ""),
    areasOfExpertise: Array.isArray(raw.areasOfExpertise) ? raw.areasOfExpertise : [],
    major: String(raw.major ?? ""),
    university: String(raw.alma_mater ?? raw.university ?? ""),
    country: String(raw.country ?? ""),
    stateProvince: String(raw.location_state ?? raw.stateProvince ?? ""),
    careerHistorySummary: String(raw.career_history_summary ?? raw.careerHistorySummary ?? ""),
    mentorshipExperience: String(raw.mentorship_experience ?? raw.mentorshipExperience ?? ""),
    uniqueCareerExperiences: Array.isArray(raw.uniqueCareerExperiences)
      ? raw.uniqueCareerExperiences
      : raw.unique_career_experiences
      ? [String(raw.unique_career_experiences)]
      : [],
  };
}

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFields, setOpenFields] = useState<Record<string, boolean>>({});

  async function fetchAdvisors() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/advisors");

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      const data = await response.json();
      setAdvisors(data.map(mapAdvisor));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const filteredAdvisors = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return advisors;
    }

    return advisors.filter((advisor) => {
      const searchableText = [
        advisor.name,
        advisor.jobTitle,
        advisor.company,
        advisor.field,
        advisor.reliabilityLevel,
        ...advisor.serviceTypes,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, advisors]);

  // Derive categories from actual data so every industry shows up
  const fieldOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const a of advisors) {
      if (a.field && !seen.has(a.field)) {
        seen.add(a.field);
        order.push(a.field);
      }
    }
    return order.sort();
  }, [advisors]);

  const groupedAdvisors = fieldOrder
    .map((field) => ({
      field,
      advisors: filteredAdvisors.filter((advisor) => advisor.field === field),
    }))
    .filter((group) => group.advisors.length > 0);

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
              Advisor Directory
            </h1>
            <p className="text-slate-600 text-sm mt-0.5">
              {loading
                ? "Loading..."
                : `${filteredAdvisors.length} advisors across ${groupedAdvisors.length} fields`}
            </p>
          </div>

          <div className="w-full md:w-80">
            <label htmlFor="advisor-search" className="sr-only">
              Search advisors
            </label>
            <input
              id="advisor-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search advisors"
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading advisors...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchAdvisors}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Advisors list */}
        {!loading && !error && (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs text-slate-600 uppercase tracking-wide font-medium">
              <div className="col-span-3">Advisor</div>
              <div className="col-span-2">Job Title</div>
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Service Type</div>
              <div className="col-span-2">Reliability Level</div>
            </div>

            <div className="space-y-4">
              {groupedAdvisors.map((group) => {
                const isOpen = openFields[group.field] !== false;

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
                        ({group.advisors.length})
                      </span>
                    </button>

                    {isOpen && (
                      <div>
                        {group.advisors.map((advisor, index) => (
                          <Link
                            key={advisor.id}
                            href={`/advisors/${advisor.id}`}
                            className={`block cursor-pointer hover:bg-slate-50 transition-colors ${
                              index !== group.advisors.length - 1
                                ? "border-b border-slate-200"
                                : ""
                            }`}
                          >
                            <div className="md:hidden flex items-start justify-between gap-3 px-4 py-3.5">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#007CA6] text-xs shrink-0 mt-0.5 font-semibold">
                                  {advisor.initials}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-zinc-900 text-sm truncate font-medium">
                                    {advisor.name}
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                    {advisor.jobTitle}
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                    {advisor.company}
                                  </p>

                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {advisor.serviceTypes.slice(0, 2).map((service) => (
                                      <span
                                        key={service}
                                        className="text-xs bg-slate-100 text-[#007CA6] px-1.5 py-0.5 rounded"
                                      >
                                        {service}
                                      </span>
                                    ))}

                                    {advisor.serviceTypes.length > 2 && (
                                      <span className="text-xs text-slate-600">
                                        +{advisor.serviceTypes.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-xs px-2 py-0.5 rounded shrink-0 font-medium ${getReliabilityStyles(
                                  advisor.reliabilityLevel
                                )}`}
                              >
                                {advisor.reliabilityLevel}
                              </span>
                            </div>

                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3.5 items-center">
                              <div className="col-span-3 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#007CA6] text-xs shrink-0 font-semibold">
                                  {advisor.initials}
                                </div>
                                <p className="text-zinc-900 text-sm truncate font-medium">
                                  {advisor.name}
                                </p>
                              </div>

                              <div className="col-span-2">
                                <p className="text-zinc-900 text-sm">
                                  {advisor.jobTitle}
                                </p>
                              </div>

                              <div className="col-span-3">
                                <p className="text-zinc-900 text-sm">
                                  {advisor.company}
                                </p>
                              </div>

                              <div className="col-span-2 flex flex-wrap gap-1">
                                {advisor.serviceTypes.slice(0, 2).map((service) => (
                                  <span
                                    key={service}
                                    className="text-xs bg-slate-100 text-[#007CA6] px-1.5 py-0.5 rounded"
                                  >
                                    {service}
                                  </span>
                                ))}

                                {advisor.serviceTypes.length > 2 && (
                                  <span className="text-xs text-slate-600">
                                    +{advisor.serviceTypes.length - 2}
                                  </span>
                                )}
                              </div>

                              <div className="col-span-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded font-medium ${getReliabilityStyles(
                                    advisor.reliabilityLevel
                                  )}`}
                                >
                                  {advisor.reliabilityLevel}
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
              {groupedAdvisors.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  {searchQuery ? "No advisors match your search." : "No advisors found."}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}
