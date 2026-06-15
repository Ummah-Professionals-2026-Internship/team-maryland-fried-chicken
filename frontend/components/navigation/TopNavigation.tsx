"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Submissions", href: "/applicants" },
  { label: "Advisors", href: "/advisors" },
  { label: "Profile", href: "/profile" },
];

export default function TopNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center justify-between px-7 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/ummah-logo.png"
            alt="Ummah Professionals logo"
            width={42}
            height={42}
            priority
          />

          <div className="leading-none">
            <div className="text-xl font-bold text-[#2F7FA8]">ummah</div>
            <div className="text-xs tracking-wide text-slate-500">
              professionals
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
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
        </div>
      </nav>
    </header>
  );
}
