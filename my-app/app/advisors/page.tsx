"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { advisors } from "@/data/advisors";

export default function AdvisorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAdvisors = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return advisors;
    }

    return advisors.filter((advisor) => {
      const searchableText = [
        advisor.name,
        advisor.role,
        advisor.industry,
        advisor.company,
        advisor.location,
        advisor.availability,
        ...advisor.specialties,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery]);

  return (
    <MainLayout>
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              Advisor Directory
            </h1>
            <p className="mt-2 text-zinc-600">
              Search and browse available advisors for applicant matching.
            </p>
          </div>

          <div className="rounded-full bg-[#2F7FA8]/10 px-4 py-2 text-sm font-medium text-[#2F7FA8]">
            {filteredAdvisors.length} advisors found
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="advisor-search"
            className="text-sm font-medium text-slate-700"
          >
            Search advisors
          </label>
          <input
            id="advisor-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, role, industry, company, or specialty"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-[#2F7FA8] focus:ring-2 focus:ring-[#2F7FA8]/20"
          />
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Advisor</th>
                <th className="px-5 py-4 font-semibold">Industry</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold">Availability</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredAdvisors.map((advisor) => (
                <tr key={advisor.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {advisor.name}
                    </div>
                    <div className="text-slate-500">
                      {advisor.role} - {advisor.company}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {advisor.industry}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {advisor.location}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {advisor.availability}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/advisors/${advisor.id}`}
                      className="rounded-full bg-[#2F7FA8] px-4 py-2 text-sm font-medium text-white hover:bg-[#256987]"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAdvisors.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-500">
              No advisors found.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {filteredAdvisors.map((advisor) => (
            <article
              key={advisor.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {advisor.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {advisor.role} - {advisor.company}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  {advisor.availability}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">Industry:</span>{" "}
                  {advisor.industry}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Location:</span>{" "}
                  {advisor.location}
                </p>
              </div>

              <Link
                href={`/advisors/${advisor.id}`}
                className="mt-5 inline-block rounded-full bg-[#2F7FA8] px-4 py-2 text-sm font-medium text-white hover:bg-[#256987]"
              >
                View Profile
              </Link>
            </article>
          ))}

          {filteredAdvisors.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              No advisors found.
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
