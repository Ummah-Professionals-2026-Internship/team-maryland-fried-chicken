import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Applicants", href: "/applicants" },
  { label: "Advisors", href: "/advisors" },
];

export default function TopNavigation() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold text-zinc-900">
          Advisor Pairing
        </Link>

        <div className="flex gap-6 text-sm font-medium text-zinc-600">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-950">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
