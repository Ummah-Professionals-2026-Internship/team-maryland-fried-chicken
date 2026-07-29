"use client";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";

// --- FORM LOGIC COMPONENT ---
function AddNewUserForm() { 
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/admin/users';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: role })
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create user account.');
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setError('A network or server-side exception occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
            Create Platform Account
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Provision brand new access credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(callbackUrl)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg border border-border bg-card cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      <Card size="sm" className="w-full">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-4 pb-2 px-6 space-y-3.5">
            <div className="space-y-0.5">
              <label className="text-muted-foreground text-xs font-medium">Full Name</label>
              <input type="text" placeholder="Harun Jimcale" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required />
            </div>

            <div className="space-y-0.5">
              <label className="text-muted-foreground text-xs font-medium">Email Address</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required />
            </div>

            <div className="space-y-0.5">
              <label className="text-muted-foreground text-xs font-medium">Temporary Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-xs font-medium block">Baseline Access Assignment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    role === 'staff' ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm' : 'bg-card text-muted-foreground border-border hover:bg-muted/30'
                  }`}
                >
                  STAFF RANK
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    role === 'admin' ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' : 'bg-card text-muted-foreground border-border hover:bg-muted/30'
                  }`}
                >
                  ADMIN RANK
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs bg-amber-100 text-amber-800 p-3 rounded-lg font-medium mt-3">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="pt-4 pb-5 px-6">
            <Button type="submit" disabled={loading} className="w-full bg-[#007CA6] hover:bg-[#00668a] text-white rounded-xl gap-1.5 cursor-pointer" >
              <UserPlus size={16} />
              {loading ? 'Provisioning Account...' : 'Create Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// --- MATCHING SKELETON FALLBACK COMPONENT ---
function FormSkeletonFallback() {
  return (
    <div className="space-y-6 max-w-sm mx-auto mt-12 animate-pulse">
      {/* Skeleton Header matching the text structure */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-2/3">
          <div className="h-6 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted/60 rounded w-5/6"></div>
        </div>
        <div className="h-8 w-8 bg-muted rounded-lg"></div>
      </div>

      {/* Skeleton Card Container */}
      <Card size="sm" className="w-full border border-border/50 shadow-none">
        <CardContent className="pt-4 pb-2 px-6 space-y-4">
          {/* Skeleton Name Input */}
          <div className="space-y-1.5">
            <div className="h-3 bg-muted/70 rounded w-1/4"></div>
            <div className="h-9 bg-muted/40 rounded-md w-full"></div>
          </div>
          {/* Skeleton Email Input */}
          <div className="space-y-1.5">
            <div className="h-3 bg-muted/70 rounded w-1/3"></div>
            <div className="h-9 bg-muted/40 rounded-md w-full"></div>
          </div>
          {/* Skeleton Password Input */}
          <div className="space-y-1.5">
            <div className="h-3 bg-muted/70 rounded w-2/5"></div>
            <div className="h-9 bg-muted/40 rounded-md w-full"></div>
          </div>
          {/* Skeleton Role Selection Buttons */}
          <div className="space-y-2">
            <div className="h-3 bg-muted/70 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-muted/40 rounded-lg w-full"></div>
              <div className="h-8 bg-muted/40 rounded-lg w-full"></div>
            </div>
          </div>
        </CardContent>
        {/* Skeleton Action Button */}
        <CardFooter className="pt-4 pb-5 px-6">
          <div className="h-10 bg-muted rounded-xl w-full"></div>
        </CardFooter>
      </Card>
    </div>
  );
}

// --- MAIN WRAPPER PAGE ---
export default function AddNewUserPage() { 
  return (
    <MainLayout>
      {/* ✅ Now using the beautiful component-matched fallback layout */}
      <Suspense fallback={<FormSkeletonFallback />}>
        <AddNewUserForm />
      </Suspense>
    </MainLayout>
  );
}
