"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme : theme;
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className={`p-2 rounded-md border border-dashGreen-light hover:bg-dashGreen-light ${className}`}
    >
      {current === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
