"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage({ searchParams }) {
  // React 19 / Next.js 15 async searchParams unwrap
  const resolvedParams = use(searchParams);
  const token = resolvedParams?.token;
  const email = resolvedParams?.email;

  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Missing parameters from the verification link.");
      return;
    }

    async function processVerification() {
      try {
        // Correct asynchronous POST network request configuration
        const response = await fetch('/api/verify-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setErrorMessage(data.error || "The link is invalid or has expired.");
        } else {
          setStatus("success");
        }
      } catch (err) {
        setStatus("error");
        setStatus("error");
        setErrorMessage("An unexpected verification network error occurred.");
      }
    }

    processVerification();
  }, [token, email]);

  // Countdown and automatic navigation redirect on success
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push("/reset-password");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm border-border">
        <CardHeader className="text-center pb-2">
          {/* Status Icons */}
          {status === "verifying" && (
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Loader2 size={24} className="animate-spin" style={{ color: "#007CA6" }} />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle size={24} className="text-rose-600" />
              </div>
            </div>
          )}

          {/* Heading */}
          <CardTitle style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {status === "verifying" && "Verifying Credentials"}
            {status === "success" && "Identity Confirmed"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4 pt-2">
          {status === "verifying" && (
            <p className="text-muted-foreground text-sm">
              Please wait while we confirm your email address...
            </p>
          )}

          {status === "success" && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Your email has been successfully verified.
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to reset password in{" "}
                <span className="font-semibold text-foreground">{countdown}s</span>...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
                {errorMessage || "The verification link is invalid or expired."}
              </div>

              <Button
                asChild
                className="w-full text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#007CA6" }}
              >
                <Link href="/login">Return to Login Portal</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}