"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Submissions", href: "/applicants" },
  { label: "Advisors", href: "/advisors" },
  { label: "Forms", href: "/forms" },
];

export default function TopNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center justify-between px-7 py-4">
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

        <div className="hidden md:flex items-center gap-2">
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
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 cursor-pointer" aria-label="Toggle menu"> {menuOpen ? <X size={24} /> : <Menu size={24}/>} </button>
      </nav>
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-7 pb-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className = {`rounded-lg px-4 py-2 text-sm font-medium ${isActive ? "bg-[#2F7FA8] text-white" : "text-slate-900 hover:bg-slate-50"
              }`}
              >
                {item.label}
            </Link>
          );
          })}
        </div>
      )}
    </header>
  );
}
