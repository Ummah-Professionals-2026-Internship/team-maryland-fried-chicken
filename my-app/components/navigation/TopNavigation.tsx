"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, ChevronDown, KeyRound } from "lucide-react";
import UserNav from "./userNav/UserNav";

type NavItem = {
  label: string;
  href: string;
  isResetBtn?: boolean; // Tag to identify the special limbo button styling
};

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formsDropdownOpen, setFormsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close forms dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setFormsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on path change
  useEffect(() => {
    setFormsDropdownOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Verify authentication state and role on navigation changes
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const resBody = await response.json();
          setIsLoggedIn(true);
          
          // Capture password limbo flag from backend metadata
          const passwordFlag = Boolean(
            resBody.data?.user_metadata?.must_change_password || 
            resBody.data?.must_change_password
          );
          setMustChangePassword(passwordFlag);

          setUserRole(resBody.data?.role || "staff");
          setUserName(
            resBody.data?.name ||
              resBody.data?.full_name ||
              resBody.data?.email ||
              "User"
          );
        } else {
          setIsLoggedIn(false);
          setMustChangePassword(false);
          setUserRole(null);
          setUserName("User");
        }
      } catch (err) {
        setIsLoggedIn(false);
        setMustChangePassword(false);
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
        setMustChangePassword(false);
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

  // Build top-level links dynamically based on state rulebook
  const getNavItems = (): NavItem[] => {
    // RULE 1 & 2: Logged-Out users OR Users trapped in Limbo
    if (!isLoggedIn || mustChangePassword) {
      const baseItems: NavItem[] = [{ label: "Landing Page", href: "/" }];
      
      // If they are specifically in password limbo, add the dedicated Reset Password button
      if (mustChangePassword) {
        baseItems.push({ label: "Reset Password", href: "/reset-password", isResetBtn: true });
      }
      
      return baseItems;
    }

    // RULE 3: Regular fully authenticated system navigation items
    const baselineProtectedItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Applicants", href: "/applicants" },
      { label: "Advisors", href: "/advisors" },
    ];

    if (userRole === "admin") {
      return [
        ...baselineProtectedItems,
        { label: "Users", href: "/admin/users" },
      ];
    }

    return baselineProtectedItems;
  };

  const formItems: NavItem[] = [
    { label: "Applicant", href: "/forms/applicants" },
    { label: "Advisor", href: "/forms/advisors" },
  ];

  const activeNavItems = getNavItems();
  const isFormsActive = pathname.startsWith("/forms");

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center justify-between px-7 py-4">
        {/* Logo */}
        <Link
          href={isLoggedIn && !mustChangePassword ? "/dashboard" : "/"}
          className="flex items-center gap-3"
        >
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
            <div className="text-sm tracking-wide text-[#2F7FA8]">
              professionals
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            // Apply distinct visual layout weight if it's the custom Reset Password button for Limbo users
            if (item.isResetBtn) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium border border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <KeyRound size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            }

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

          {/* Forms Dropdown Menu (Always visible for Form processing) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFormsDropdownOpen(!formsDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isFormsActive
                  ? "bg-[#2F7FA8] text-white"
                  : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Forms</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  formsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {formsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50">
                {formItems.map((form) => {
                  const isFormActive = pathname === form.href;
                  return (
                    <Link
                      key={form.href}
                      href={form.href}
                      onClick={() => setFormsDropdownOpen(false)}
                      className={`block rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        isFormActive
                          ? "bg-[#2F7FA8] text-white"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {form.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Auth Slot logic update */}
          {isLoggedIn ? (
            mustChangePassword ? (
              /* ✨ If user is authenticated but stuck in limbo: show an explicit Logout button instead of UserNav dropdown */
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              /* Otherwise show normal profile nav dropdown */
              <UserNav 
                userName={userName} 
                onLogout={handleLogout} 
                isForcedReset={false}
              />
            )
          ) : (
            /* Show login option for unauthenticated viewers */
            <button
              onClick={handleLoginRedirect}
              className="rounded-full px-5 py-2 text-sm font-medium border border-[#2F7FA8] bg-white text-[#2F7FA8] hover:bg-slate-50 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 cursor-pointer text-slate-700"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-7 pb-4 border-t border-slate-100 pt-3">
          {activeNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            
            if (item.isResetBtn) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-amber-50 text-amber-800 px-4 py-2 text-sm font-medium border border-amber-200"
                >
                  <KeyRound size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            }

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

          {/* Mobile Forms Accordion Group */}
          <div className="border-t border-slate-100 my-1 pt-2">
            <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Forms
            </div>
            {formItems.map((form) => {
              const isFormActive = pathname === form.href;
              return (
                <Link
                  key={form.href}
                  href={form.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-6 py-2 text-sm font-medium ${
                    isFormActive
                      ? "bg-[#2F7FA8] text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {form.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Account Options Context Drawer */}
          {isLoggedIn ? (
            <div className="border-t border-slate-200 mt-1 pt-2 space-y-1">
              <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account ({userName})
              </div>
              
              {/* Omit routing shortcuts entirely on mobile layouts if caught in password limbo */}
              {!mustChangePassword && (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  <span>Profile</span>
                </Link>
              )}
              
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