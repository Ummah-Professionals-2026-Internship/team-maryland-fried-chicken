"use client";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function AddNewUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Snag where they came from so we can drop them back there afterwards
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
      // 2. Fire the POST request to your core /api/users endpoint
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
        // 3. Success! Push them straight back to the managed directory
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setError('A network or server-side exception occurred.');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-sm mx-auto mt-12">
        
        {/* BACK TO DIRECTORY HEADER BREADCRUMB */}
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

              {/* Full Name Input */}
              <div className="space-y-0.5">
                <label className="text-muted-foreground text-xs font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Harun Jimcale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Email Input */}
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

              {/* Password Input */}
              <div className="space-y-0.5">
                <label className="text-muted-foreground text-xs font-medium">Temporary Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Role Rank Assignment Picker */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium block">Baseline Access Assignment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      role === 'staff' 
                        ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm' 
                        : 'bg-card text-muted-foreground border-border hover:bg-muted/30'
                    }`}
                  >
                    STAFF RANK
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      role === 'admin' 
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' 
                        : 'bg-card text-muted-foreground border-border hover:bg-muted/30'
                    }`}
                  >
                    ADMIN RANK
                  </button>
                </div>
              </div>

              {/* Error Package Notice */}
              {error && (
                <p className="text-xs bg-amber-100 text-amber-800 p-3 rounded-lg font-medium mt-3">
                  {error}
                </p>
              )}
            </CardContent>

            <CardFooter className="pt-4 pb-5 px-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#007CA6] hover:bg-[#00668a] text-white rounded-xl gap-1.5 cursor-pointer"
              >
                <UserPlus size={16} />
                {loading ? 'Provisioning Account...' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}