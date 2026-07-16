"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Verify authentication state and role profile mapping on navigation changes
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const resBody = await response.json();
          setIsLoggedIn(true);
          setUserRole(resBody.data?.role || "staff"); // Fallback defaults to baseline staff access
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }
    checkAuthStatus();
  }, [pathname]);

  const handleAuthAction = async () => {
    setMenuOpen(false);

    if (isLoggedIn) {
      try {
        const response = await fetch("/api/signout", {
          method: "POST",
        });

        if (response.ok) {
          setIsLoggedIn(false);
          setUserRole(null);
          router.push("/");
        } else {
          console.error("Signout failed");
        }
      } catch (err) {
        console.error("Error signing out:", err);
      }
    } else {
      if (pathname === "/") {
        router.push("/login");
      } else {
        const encodedCallback = encodeURIComponent(pathname);
        router.push(`/login?callbackUrl=${encodedCallback}`);
      }
    }
  };

  // Dynamically compile available navigation links based on user role context
  const getNavItems = (): NavItem[] => {
    if (!isLoggedIn) {
      return [
        { label: "Landing Page", href: "/" },
        { label: "Applicant Form", href: "/forms/applicants" },
        { label: "Advisor Form", href: "/forms/advisors" },
      ];
    }

    const baselineProtectedItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Applicants", href: "/applicants" },
      { label: "Advisors", href: "/advisors" },
      { label: "Applicant Form", href: "/forms/applicants" },
      { label: "Advisor Form", href: "/forms/advisors" }
    ];

    if (userRole === "admin") {
      return [
        ...baselineProtectedItems,
        { label: "User Management", href: "/admin/users" },
      ];
    }

    return baselineProtectedItems;
  };

  const activeNavItems = getNavItems();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center justify-between px-7 py-4">
        {/* Logo Section */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl">
            <Image
              src="/images/ummah-logo.png"
              alt="Ummah Professionals logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-none">
            <div className="text-xl font-bold text-[#2F7FA8]">ummah</div>
            <div className="text-xs tracking-wide text-slate-500">
              professionals
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-3">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${isActive
                    ? "bg-[#2F7FA8] text-white"
                    : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Desktop Authentication Button */}
          <button
            onClick={handleAuthAction}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors border cursor-pointer ${isLoggedIn
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-[#2F7FA8] bg-white text-[#2F7FA8] hover:bg-slate-50"
              }`}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 cursor-pointer text-slate-700"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-7 pb-4">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${isActive
                    ? "bg-[#2F7FA8] text-white"
                    : "text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mobile Authentication Button */}
          <button
            onClick={handleAuthAction}
            className={`w-full text-left rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${isLoggedIn
                ? "text-red-600 hover:bg-red-50"
                : "text-slate-900 hover:bg-slate-50"
              }`}
          >
            {isLoggedIn ? "Logout" : "Volunteer Login"}
          </button>
        </div>
      )}
    </header>
  );
}