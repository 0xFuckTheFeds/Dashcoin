"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExternalLink } from "lucide-react";
import { DashcStatsBar, DashcStatsBarProps } from "@/components/dashc-stats-bar";

interface NavbarProps {
  dashcoinTradeLink: string;
  dashcStats?: DashcStatsBarProps;
}

export function Navbar({ dashcoinTradeLink, dashcStats }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/">
            <DashcoinLogo size={56} />
          </Link>
          <a
            href={dashcoinTradeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dashYellow hover:text-dashYellow-dark font-medium dashcoin-text flex items-center text-lg"
          >
            SUPPORT THE PAGE <ExternalLink className="h-4 w-4 ml-1" />
          </a>
          {dashcStats && (
            <div className="mt-4 md:mt-0 w-full md:w-auto md:ml-4">
              <DashcStatsBar {...dashcStats} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/" active={pathname === "/"}>
              Overview
            </NavLink>
            <NavLink href="/research" active={pathname === "/research"}>
              Research
            </NavLink>
            <NavLink href="/compare" active={pathname === "/compare"}>
              Graphs & Comparisons
            </NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden mt-4 border-t border-dashGreen-light pt-4">
        <nav className="flex justify-between">
          <NavLink href="/" active={pathname === "/"}>
            Overview
          </NavLink>
          <NavLink href="/research" active={pathname === "/research"}>
            Research
          </NavLink>
          <NavLink href="/compare" active={pathname === "/compare"}>
            Graphs & Comparisons
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`dashcoin-text text-lg ${
        active
          ? "text-dashYellow border-b-2 border-dashYellow"
          : "text-dashYellow-light hover:text-dashYellow"
      }`}
    >
      {children}
    </Link>
  );
}