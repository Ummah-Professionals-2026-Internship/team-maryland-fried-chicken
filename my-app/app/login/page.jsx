"use client";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";


// --- LOGIN FORM LOGIC COMPONENT ---
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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

  return (
    <div className="space-y-6 max-w-sm mx-auto mt-12">
      <div>
        <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
          Login
        </h1>

        <p className="text-muted-foreground text-sm mt-0.5">
          Enter your credentials to access dashboard.
        </p>
      </div>

      <Card size="sm" className="w-full">
        <form onSubmit={handleSubmit}>

          <CardContent className="pt-2 pb-2 px-6">

            <div className="space-y-0.5">
              <label className="text-muted-foreground text-xs font-medium">
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
              <label className="text-muted-foreground text-xs font-medium">
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
              <p className="text-xs bg-amber-100 text-amber-800 p-3 rounded-lg font-medium mt-3">
                {error}
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