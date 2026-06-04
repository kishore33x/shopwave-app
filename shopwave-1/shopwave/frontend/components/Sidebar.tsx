"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/predictions", label: "Predictions" }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-900/95 p-6 backdrop-blur-md transition-all duration-200 lg:block">
      <p className="font-display text-2xl font-bold text-white">Shopwave</p>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-300">Team Klyzer</p>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "translate-x-1 bg-white/10 text-white"
                  : "text-slate-300 hover:translate-x-0.5 hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
