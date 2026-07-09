"use client"; // Tells Next.js: "This is frontend UI running in Google Chrome"

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
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
      const redirectTo = searchParams.get('callbackUrl') || '/dashboard'
      router.push(redirectTo)
    }
  };

  return (
    <MainLayout>
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
            {/* Changed pt-5 to pt-2 to shift the entire block straight up */}
            <CardContent className="pt-2 pb-2 px-6NDA">

              {/* Email Block */}
              <div className="space-y-0.5">
                <label className="text-muted-foreground text-xs font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Password Block */}
              <div className="space-y-0.5 mt-2.5">
                <label className="text-muted-foreground text-xs font-medium">Password</label>
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

            {/* Added pt-4 to create clean breathing room above the Log In button line */}
            <CardFooter className="flex flex-col space-y-3 pt-4">
              <Button type="submit" variant="outline" size="sm" className="w-full">
                Log In
              </Button>

              
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}