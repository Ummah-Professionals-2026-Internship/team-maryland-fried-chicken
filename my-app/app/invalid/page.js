// "use client";
// this page is here if its needed but for now it's commented out and not used.
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function InvalidRequestPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="w-full max-w-sm mx-auto mt-24 space-y-4">
        <Card size="sm" className="w-full text-center border-slate-200 shadow-sm">
          <CardHeader className="pt-6 flex flex-col items-center">
            {/* Soft amber alert icon badge */}
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3 border border-amber-100">
              <AlertCircle size={24} className="text-amber-600" />
            </div>

            <CardTitle
              className="text-zinc-900"
              style={{ fontSize: "1.25rem", fontWeight: 700 }}
            >
              Invalid Request
            </CardTitle>

            <CardDescription className="text-slate-500 text-xs mt-1">
              Error Code: 400 Bad Request
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              We couldn't process your request. Please try again, or return to the home page if the problem persists.
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