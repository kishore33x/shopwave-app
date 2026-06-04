"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("shopwave-theme");
    const enabled = stored === "dark";
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("shopwave-theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/50 px-4 py-4 backdrop-blur-md transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">E-commerce Intelligence Hub</h1>
          <p className="text-xs text-slate-300">Trend detection, category performance, and sales forecasting</p>
        </div>
        <button
          type="button"
          onClick={toggleDark}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
        >
          {darkMode ? "Light" : "Dark"} mode
        </button>
      </div>
    </header>
  );
}
