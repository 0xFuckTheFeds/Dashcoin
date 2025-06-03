"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { DashcStatsBar, DashcStatsBarProps } from "@/components/dashc-stats-bar";

interface NavbarProps {
  dashcStats?: DashcStatsBarProps;
}

export function Navbar({ dashcStats }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/">
            <DashcoinLogo size={56} />
          </Link>
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
            <NavLink href="/compare" active={pathname === "/compare"}>
              Compare Tokens
            </NavLink>
            <NavLink href="/creator-wallets" active={pathname === "/creator-wallets"}>
              Creator Wallets
            </NavLink>
            <NavLink href="/alpha" active={pathname === "/alpha"}>
              DASHC Alpha Group
            </NavLink>
            <NavLink href="https://dashcoin-research.gitbook.io/dashcoin-research" active={false} external>
              Founder's Guide
            </NavLink>
          </nav>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden mt-4 border-t border-dashGreen-light pt-4">
        <nav className="flex justify-between">
          <NavLink href="/" active={pathname === "/"}>
            Overview
          </NavLink>
          <NavLink href="/compare" active={pathname === "/compare"}>
            Compare Tokens
          </NavLink>
          <NavLink href="/creator-wallets" active={pathname === "/creator-wallets"}>
            Creator Wallets
          </NavLink>
          <NavLink href="/alpha" active={pathname === "/alpha"}>
            DASHC Alpha
          </NavLink>
          <NavLink href="https://dashcoin-research.gitbook.io/dashcoin-research" active={false} external>
            Founder's Guide
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
  external?: boolean;
}

function NavLink({ href, active, children, external = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
