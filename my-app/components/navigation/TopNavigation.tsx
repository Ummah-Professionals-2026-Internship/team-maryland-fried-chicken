"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Submissions", href: "/applicants" },
  { label: "Advisors", href: "/advisors" },
  { label: "Forms", href: "/forms" },
];

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkAuthStatus();
  }, [pathname]); // Re-verify whenever the path changes to keep the state accurate

  const handleAuthAction = async () => {
    setMenuOpen(false); // Close mobile drawer if it's open

    if (isLoggedIn) {
      // 1. Trigger the logout endpoint
      try {
        const response = await fetch("/api/signout", {
          method: "POST",
        });

        if (response.ok) {
          setIsLoggedIn(false);
          // 2. Redirect to login page WITHOUT callbackUrl
          router.push("/login");
        } else {
          console.error("Signout failed");
        }
      } catch (err) {
        console.error("Error signing out:", err);
      }
    } else {
      // 3. Redirect to login WITH the current pathname as callbackUrl
      const encodedCallback = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${encodedCallback}`);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center justify-between px-7 py-4">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-3">
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
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

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

          {/* Desktop Authentication Button */}
          <button
            onClick={handleAuthAction}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors border cursor-pointer ${
              isLoggedIn
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
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive
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
            className={`w-full text-left rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              isLoggedIn
                ? "text-red-600 hover:bg-red-50"
                : "text-slate-900 hover:bg-slate-50"
            }`}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      )}
    </header>
  );
}