import Link from "next/link";
import { notFound } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { advisors } from "@/data/advisors";

type AdvisorProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvisorProfilePage({
  params,
}: AdvisorProfilePageProps) {
  const { id } = await params;
  const advisor = advisors.find((item) => item.id === id);

  if (!advisor) {
    notFound();
  }

  return (
    <MainLayout>
      <section className="w-full max-w-[1100px] mx-auto space-y-6">
        <Link
          href="/advisors"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
          Back to Advisor Directory
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-3xl font-bold text-zinc-900">{advisor.name}</h1>
          <p className="mt-3 text-xl text-slate-700">{advisor.jobTitle}</p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-600">Industry</p>
              <p className="mt-2 text-lg text-zinc-900">{advisor.field}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Availability
              </p>
              <p className="mt-2 text-lg text-zinc-900">
                {advisor.availability}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
