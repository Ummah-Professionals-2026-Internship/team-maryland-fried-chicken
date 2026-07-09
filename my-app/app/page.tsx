import Link from "next/link";
import { ArrowRight, FileText, Users, UserCheck } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const cards = [
  {
    icon: Users,
    title: "Volunteer Login",
    description:
      "Access the volunteer dashboard to manage applicant matches and advisor assignments.",
    cta: "Volunteer Login",
    href: "/dashboard",
  },
  {
    icon: FileText,
    title: "Applicant Registration",
    description:
      "Submit your profile to be matched with a professional advisor who can help guide your career.",
    cta: "Applicant Registration Form",
    href: "/forms?tab=applicant",
  },
  {
    icon: UserCheck,
    title: "Advisor Registration",
    description:
      "Join as a volunteer advisor and share your professional experience with aspiring Muslims.",
    cta: "Advisor Registration Form",
    href: "/forms?tab=advisor",
  },
];

const stats = [
  { value: "120+", label: "Active Advisors" },
  { value: "450+", label: "Applicants Matched" },
  { value: "3", label: "Services Offered" },
];

export default function HomePage() {
  return (
    <MainLayout>
      <section className="mx-auto flex max-w-4xl flex-col items-center py-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F2F8] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#2F7FA8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2F7FA8]" />
          Advisor Pairing Engine
        </span>

        <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-[#12283A] sm:text-6xl">
          Connecting Muslim Professionals{" "}
          <span className="text-[#2F7FA8]">with the Next Generation</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-500">
          Ummah Professionals pairs students and early-career applicants with
          volunteer advisors who offer resume reviews, mock interviews, and
          mentorship — all within our community.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F2F8] text-[#2F7FA8]">
                <Icon className="h-5 w-5" />
              </span>

              <h2 className="mt-6 text-lg font-bold text-[#12283A]">
                {card.title}
              </h2>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                {card.description}
              </p>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F7FA8]">
                {card.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto mt-14 max-w-5xl border-t border-slate-200 pt-10">
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-[#12283A]">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
