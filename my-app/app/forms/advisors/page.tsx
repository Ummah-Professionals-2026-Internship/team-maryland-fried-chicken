"use client";

import * as React from "react";
import MainLayout from "@/layouts/MainLayout";
import AdvisorForm from "@/components/forms/AdvisorForm";

export default function AdvisorRegistrationPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Advisor Registration</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <AdvisorForm />
      </div>
    </MainLayout>
  );
}