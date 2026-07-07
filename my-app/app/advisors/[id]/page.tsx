import Link from "next/link";
import { notFound } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { advisors } from "@/data/advisors";

type AdvisorProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const NotProvided = () => (
  <span className="text-sm italic text-slate-400">Not Provided</span>
  );


function getReliabilityStyles(level: string) {
  if (level === "High") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (level === "Medium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-1">
      <p className="pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-[#007CA6]">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-0">
      <p className="mb-0.5 text-xs text-slate-500">{label}</p>
      <div className="text-sm font-medium text-zinc-900">{children}</div>
    </div>
  );
}

function TextRow({ label, text }: { label: string; text?: string }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-0">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      {text?.trim() ? (
        <p className="text-sm leading-7 text-zinc-900">{text}</p>
      ) : (
        <NotProvided />
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function UsersIcon() {
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
      className="text-slate-500"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default async function AdvisorProfilePage({
  params,
}: AdvisorProfilePageProps) {
  const { id } = await params;
  const advisor = advisors.find((item) => item.id === id);

  if (!advisor) {
    notFound();
  }

  const capacityPercent = Math.round(
    (advisor.monthlyCapacityUsed / advisor.monthlyCapacityTotal) * 100
  );

  
  return (
    <MainLayout>
      <section className="w-full max-w-[1100px] mx-auto space-y-5">
        <Link
          href="/advisors"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
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

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-[#007CA6]">
              {advisor.initials}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-zinc-900">{advisor.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {advisor.jobTitle} · {advisor.company}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <CheckIcon />
                  {advisor.availability}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getReliabilityStyles(
                    advisor.reliabilityLevel
                  )}`}
                >
                  {advisor.reliabilityLevel}
                </span>

                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Career Prep Default: {advisor.careerPrepDefault ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon />
              <span className="text-sm font-semibold text-zinc-900">
                Monthly Capacity
              </span>
            </div>

            <span className="text-sm text-slate-500">
              <span className="font-bold text-zinc-900">
                {advisor.monthlyCapacityUsed}
              </span>{" "}
              / {advisor.monthlyCapacityTotal} meetings
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-500">
            {capacityPercent}% of monthly capacity used
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoSection title="Activity">
            <InfoRow label="Last Event">{advisor.lastEvent}</InfoRow>
            <InfoRow label="Last Career Prep">{advisor.lastCareerPrep}</InfoRow>
            <InfoRow label="Sign Up Date">{advisor.signUpDate}</InfoRow>
          </InfoSection>

          <InfoSection title="Employment">
            <InfoRow label="Employer">{advisor.company}</InfoRow>
            <InfoRow label="Job Title">{advisor.jobTitle}</InfoRow>
            <InfoRow label="Experience Level">{advisor.experienceLevel}</InfoRow>
            <InfoRow label="Industry">{advisor.field}</InfoRow>
          </InfoSection>

          <InfoSection title="Volunteering">
            <InfoRow label="Volunteering For / Services">
              <div className="mt-1 py-3 flex flex-wrap gap-1.5">
                {advisor.serviceTypes.map((service) => (
                  <span
                    key={service}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#007CA6]"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </InfoRow>
            </InfoSection>
            <InfoSection title="Experience">
               <InfoRow label="Areas of Expertise">
                {advisor.areasOfExpertise.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {advisor.areasOfExpertise.map((area) => (
                      <span key={area} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-zinc-900">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <NotProvided />
                )}
              </InfoRow>
            </InfoSection>

          <InfoSection title="Education & Location">
            <InfoRow label="Major">{advisor.major}</InfoRow>
            <InfoRow label="University">{advisor.university}</InfoRow>
            <InfoRow label="Country">{advisor.country}</InfoRow>
            <InfoRow label="State / Province">{advisor.stateProvince}</InfoRow>
          </InfoSection>

                <InfoSection title="Background">
          <TextRow
            label="Career Journey"
            text={advisor.careerHistorySummary}
          />
          {/* <TextRow
            label="Unique Career Experiences"
            text={advisor.uniqueCareerExperiences}
          /> */}
          <InfoRow label="Unique Career Experiences">
            {advisor.uniqueCareerExperiences.length > 0 ? (
              <div className="mt-1 py-3 flex flex-wrap gap-1.5">
                {advisor.uniqueCareerExperiences.map((experience) => (
                  <span key={experience} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#007CA6]">
                    {experience}
                  </span>
                ))}
              </div>
            ) : (
              <NotProvided />
            )}
          </InfoRow>
          <div className="py-4">
            <p className="mb-1 text-xs text-slate-500">Mentorship Experience</p>
            {advisor.mentorshipExperience?.trim() ? (
              <p className="text-sm text-zinc-900">{advisor.mentorshipExperience}</p>
            ) : (
              <NotProvided />
            )}
          </div>
        </InfoSection>
        </div>
      </section>
    </MainLayout>
  );
}
