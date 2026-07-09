"use client";

import * as React from "react";
import MainLayout from "@/layouts/MainLayout";
import ApplicantForm from "@/components/forms/ApplicantForm";
import AdvisorForm from "@/components/forms/AdvisorForm";
import { cn } from "@/lib/utils";

type Tab = "applicant" | "advisor";

export default function FormsPage() {
  const [tab, setTab] = React.useState<Tab>("applicant");

  // Honor a ?tab=applicant|advisor query param (e.g. from the landing page).
  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "applicant" || requested === "advisor") {
      setTab(requested);
    }
  }, []);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit applicant or advisor information directly into the system.
        </p>
      </div>

      <div className="mb-8 inline-flex rounded-lg bg-slate-100 p-1">
        <TabButton
          active={tab === "applicant"}
          onClick={() => setTab("applicant")}
        >
          Applicant Submission
        </TabButton>
        <TabButton active={tab === "advisor"} onClick={() => setTab("advisor")}>
          Advisor Management
        </TabButton>
      </div>

      {tab === "applicant" ? <ApplicantForm /> : <AdvisorForm />}
    </MainLayout>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#2F7FA8] text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}
