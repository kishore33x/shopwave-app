import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Shopwave | Klyzer",
  description: "E-commerce analytics dashboard for trend detection and sales forecasting"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans text-white transition-colors duration-300">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen w-full flex-col transition-colors duration-300">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-6 transition-all duration-300 ease-in-out sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="mx-auto w-full max-w-7xl px-4 pb-6 text-xs text-slate-300 transition-colors duration-300 sm:px-6 lg:px-8">
              <Link href="/dashboard" className="font-semibold text-cyan-300 transition-all duration-200 hover:text-cyan-200">
                Shopwave
              </Link>{" "}
              by Team Klyzer
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
