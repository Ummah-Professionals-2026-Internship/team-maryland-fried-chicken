"use client";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// --- LOGIN FORM LOGIC COMPONENT ---
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Resend Verification Link State
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState(null);
  const [isResending, setIsResending] = useState(false);

  // Handle timer ticker for the 60s cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error);
    } else {
      const redirectTo = searchParams.get('callbackUrl') || '/dashboard';
      router.push(redirectTo);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const res = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setResendStatus({ type: 'success', message: 'Verification email sent! Please check your inbox.' });
        setResendCooldown(60); // Start 60-second cooldown timer
      } else {
        setResendStatus({ type: 'error', message: data.error || 'Failed to resend verification email.' });
      }
    } catch (err) {
      setResendStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const isUnverifiedError = error && error.toLowerCase().includes('not verified');

  return (
    <div className="space-y-6 max-w-sm mx-auto mt-12">
      <div>
        <h1 className="text-zinc-900" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
          Login
        </h1>

        <p className="text-slate-600 text-sm mt-0.5">
          Enter your credentials to access dashboard.
        </p>
      </div>

      <Card size="sm" className="w-full">
        <form onSubmit={handleSubmit}>

          <CardContent className="pt-2 pb-2 px-6">

            <div className="space-y-0.5">
              <label className="text-slate-600 text-xs font-medium">
                Email Address
              </label>

              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>


            <div className="space-y-0.5 mt-2.5">
              <label className="text-slate-600 text-xs font-medium">
                Password
              </label>

              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>


            {error && (
              <div className="text-xs bg-amber-100 text-amber-900 p-3 rounded-lg font-medium mt-3 space-y-1.5">
                <p>{error}</p>

                {/* RESEND VERIFICATION ACTION BLOCK */}
                {isUnverifiedError && (
                  <div className="pt-1 text-[11px] border-t border-amber-200/80">
                    <span>Didn't see an email here? </span>
                    {resendCooldown > 0 ? (
                      <span className="text-amber-700/60 font-semibold cursor-not-allowed">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="underline font-semibold text-amber-900 hover:text-amber-950 disabled:opacity-50 cursor-pointer"
                      >
                        {isResending ? 'Sending...' : 'Resend link'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RESEND STATUS FEEDBACK BANNER */}
            {resendStatus && (
              <p
                className={`text-xs p-2.5 rounded-lg font-medium mt-2.5 ${
                  resendStatus.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {resendStatus.message}
              </p>
            )}

          </CardContent>


          <CardFooter className="flex flex-col space-y-3 pt-4">
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Log In
            </Button>
          </CardFooter>

        </form>
      </Card>

    </div>
  );
}


// --- SKELETON FALLBACK ---
function LoginSkeleton() {
  return (
    <div className="space-y-6 max-w-sm mx-auto mt-12 animate-pulse">

      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted/60 rounded w-2/3"></div>
      </div>

      <Card size="sm" className="w-full">
        <CardContent className="pt-2 pb-2 px-6 space-y-4">

          <div className="space-y-1.5">
            <div className="h-3 bg-muted rounded w-1/4"></div>
            <div className="h-9 bg-muted/40 rounded-md"></div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 bg-muted rounded w-1/4"></div>
            <div className="h-9 bg-muted/40 rounded-md"></div>
          </div>

        </CardContent>

        <CardFooter className="pt-4">
          <div className="h-9 bg-muted rounded-md w-full"></div>
        </CardFooter>

      </Card>

    </div>
  );
}


// --- PAGE WRAPPER ---
export default function LoginPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </MainLayout>
  );
}