"use client";

import { useTheme } from "@/lib/theme";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className, size = "md" }) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "p-1.5 h-8 w-8",
    md: "p-2 h-9 w-9",
    lg: "p-2.5 h-10 w-10",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "rounded-full transition-all duration-200 border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] flex items-center justify-center shadow-xs cursor-pointer",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <SunIcon className={cn(iconSizes[size] || iconSizes.md, "text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45")} />
      ) : (
        <MoonIcon className={cn(iconSizes[size] || iconSizes.md, "text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0")} />
      )}
    </button>
  );
}
