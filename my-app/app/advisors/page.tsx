import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";
import { advisors } from "@/data/advisors";

export default function AdvisorsPage() {
  return (
    <MainLayout>
      <section>
        <h1 className="text-3xl font-bold text-zinc-900">Advisor Directory</h1>
        <p className="mt-2 text-zinc-600">
          Browse available advisors and view their individual profiles.
        </p>

        <div className="mt-6 grid gap-4">
          {advisors.map((advisor) => (
            <Link
              key={advisor.id}
              href={`/advisors/${advisor.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    {advisor.name}
                  </h2>
                  <p className="mt-1 text-zinc-600">{advisor.role}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {advisor.industry}
                  </p>
                </div>

                <span className="rounded-full bg-[#2F7FA8] px-4 py-2 text-sm font-medium text-white">
                  View Profile
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
