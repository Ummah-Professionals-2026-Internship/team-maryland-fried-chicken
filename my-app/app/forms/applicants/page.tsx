"use client";

import * as React from "react";
import MainLayout from "@/layouts/MainLayout";
import ApplicantForm from "@/components/forms/ApplicantForm";

export default function ApplicantsPage() {
  return (
    <MainLayout>
      <ApplicantForm />
    </MainLayout>
  );
}