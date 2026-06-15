import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <section>
        <h1 className="text-3xl font-bold text-zinc-900">
          Advisor Pairing Dashboard
        </h1>

        <p className="mt-2 text-zinc-600">
          Use the navigation above to view dashboard, applicant, and advisor routes.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-200 bg-white p-4 font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Dashboard
          </Link>

          <Link
            href="/applicants"
            className="rounded-lg border border-zinc-200 bg-white p-4 font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Applicants
          </Link>

          <Link
            href="/advisors"
            className="rounded-lg border border-zinc-200 bg-white p-4 font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Advisors
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
