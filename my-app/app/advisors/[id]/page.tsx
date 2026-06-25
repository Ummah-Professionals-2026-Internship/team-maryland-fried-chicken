import Link from "next/link";
import { notFound } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { advisors } from "@/data/advisors";

type AdvisorDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvisorDetailsPage({
  params,
}: AdvisorDetailsPageProps) {
  const { id } = await params;
  const advisor = advisors.find((advisor) => advisor.id === id);

  if (!advisor) {
    notFound();
  }

  return (
    <MainLayout>
      <Link
        href="/advisors"
        className="inline-block rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
      >
        ? Back to Advisor Directory
      </Link>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-zinc-900">{advisor.name}</h1>
        <p className="mt-2 text-lg text-zinc-600">{advisor.role}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-500">Industry</h2>
            <p className="mt-1 text-zinc-900">{advisor.industry}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-500">Availability</h2>
            <p className="mt-1 text-zinc-900">{advisor.availability}</p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
