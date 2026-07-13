"use client";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="w-full max-w-sm mx-auto mt-24 space-y-4">
        <Card size="sm" className="w-full text-center border-slate-200 shadow-sm">
          <CardHeader className="pt-6 flex flex-col items-center">
            {/* Soft red alert icon badge following your dashboard's stats icon design pattern */}
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3 border border-red-100">
              <ShieldAlert size={24} className="text-red-600" />
            </div>
            
            <CardTitle className="text-zinc-900" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Access Denied
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              Error Code: 403 Forbidden
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Your are not authorized to access this resource. 
            </p>
          </CardContent>

          <CardFooter className="pt-2 pb-6 px-6">
            <Button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-[#007CA6] hover:bg-[#00668a] text-white rounded-xl gap-1.5 cursor-pointer font-semibold text-sm h-10 shadow-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Return to home.
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}