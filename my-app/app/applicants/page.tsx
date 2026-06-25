import MainLayout from "@/layouts/MainLayout";
import ApplicantGroup from "@/components/ui/applicant_table";
import { allApplicants } from "./data";

const technology = allApplicants.filter((a) => a.category === "Technology");
const marketing = allApplicants.filter((a) => a.category === "Marketing");
const finance = allApplicants.filter((a) => a.category === "Finance");
const healthcare = allApplicants.filter((a) => a.category === "Healthcare");
const legal = allApplicants.filter((a) => a.category === "Legal");

export default function ApplicantsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
                Applicants List
              </h1>

        <ApplicantGroup category="Technology" applicants={technology} />
        <ApplicantGroup category="Marketing" applicants={marketing} />
        <ApplicantGroup category="Finance" applicants={finance} />
        <ApplicantGroup category="Healthcare" applicants={healthcare} />
        <ApplicantGroup category="Legal" applicants={legal} />
      </div>
    </MainLayout>
  );
}