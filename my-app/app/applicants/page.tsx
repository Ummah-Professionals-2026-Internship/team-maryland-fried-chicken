import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";

export default function ApplicantsPage() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-zinc-900">Applicants List</h1>
      <p className="mt-2 text-zinc-600">Placeholder applicants list page.</p>

      <Link href="/applicants/1" className="mt-4 inline-block text-blue-600 underline">
        View sample applicant
      </Link>
    </MainLayout>
  );
}
