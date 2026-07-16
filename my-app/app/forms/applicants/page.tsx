"use client";

import * as React from "react";
import MainLayout from "@/layouts/MainLayout";
import ApplicantForm from "@/components/forms/ApplicantForm";

export default function ApplicantsPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applicant Registration</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <ApplicantForm />
      </div>
    </MainLayout>
  );
}