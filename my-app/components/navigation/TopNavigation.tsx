// components/TopNavigation.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import UserNav from "./userNav/UserNav";

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
  const [userName, setUserName] = useState<string>("User");

  // Verify authentication state and role on navigation changes
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const resBody = await response.json();
          setIsLoggedIn(true);
          setUserRole(resBody.data?.role || "staff");
          setUserName(
            resBody.data?.name ||
            resBody.data?.full_name ||
            resBody.data?.email ||
            "User"
          );
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          setUserName("User");
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName("User");
      }
    }
    checkAuthStatus();
  }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      const response = await fetch("/api/signout", { method: "POST" });
      if (response.ok) {
        setIsLoggedIn(false);
        setUserRole(null);
        router.push("/");
      }
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleLoginRedirect = () => {
    setMenuOpen(false);
    if (pathname === "/") {
      router.push("/login");
    } else {
      const encodedCallback = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${encodedCallback}`);
    }
  };

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
      { label: "Advisor Form", href: "/forms/advisors" },
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
        {/* Logo */}
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
            <div className="text-xs tracking-wide text-slate-500">professionals</div>
          </div>
        </Link>

        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-3">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#2F7FA8] text-white"
                    : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Desktop User Dropdown component or Login button */}
          {isLoggedIn ? (
            <UserNav userName={userName} onLogout={handleLogout} />
          ) : (
            <button
              onClick={handleLoginRedirect}
              className="rounded-full px-5 py-2 text-sm font-medium border border-[#2F7FA8] bg-white text-[#2F7FA8] hover:bg-slate-50 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 cursor-pointer text-slate-700"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu View */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-7 pb-4 border-t border-slate-100 pt-3">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive ? "bg-[#2F7FA8] text-white" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mobile Account Options */}
          {isLoggedIn ? (
            <div className="border-t border-slate-200 mt-2 pt-2 space-y-1">
              <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account ({userName})
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginRedirect}
              className="w-full text-left rounded-lg px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}