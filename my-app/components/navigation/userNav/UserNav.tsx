// components/UserNav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";

interface UserNavProps {
  userName: string;
  onLogout: () => void;
  isForcedReset: boolean; // ✨ Flags if the user is stuck in password limbo
}

export default function UserNav({ userName, onLogout, isForcedReset }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Displays User Icon + Name + Dropdown Arrow */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <User size={14} />
        </div>
        <span>{userName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200 z-50">
          
          {/* 🔒 STRIP AWAY PROFILE LINK IF USER IS IN LIMBO */}
          {!isForcedReset && (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <User size={16} />
              <span>Profile</span>
            </Link>
          )}

          {/* 🚪 LOGOUT BUTTON (Always visible to everyone) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}