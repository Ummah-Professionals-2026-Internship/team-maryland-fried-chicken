import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";

export default function AdvisorsPage() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-zinc-900">Advisor Directory</h1>
      <p className="mt-2 text-zinc-600">Placeholder advisor directory page.</p>

      <Link href="/advisors/1" className="mt-4 inline-block text-blue-600 underline">
        View sample advisor
      </Link>
    </MainLayout>
  );
}
