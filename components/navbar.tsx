"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { DashcStatsBar, DashcStatsBarProps } from "@/components/dashc-stats-bar";
import { Menu, X, ExternalLink } from "lucide-react";

interface NavbarProps {
  dashcStats?: DashcStatsBarProps;
}

export function Navbar({ dashcStats }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Overview" },
    { href: "/compare", label: "Compare" },
    { href: "/creator-wallets", label: "Wallets" },
    { href: "/founder-interviews", label: "Interviews" },
    { href: "https://dashcoin-research.gitbook.io/dashcoin-research", label: "Guide", external: true },
    { href: "https://dashcoin-research-tg-gated.vercel.app/", label: "Join Group", external: true, highlight: true }
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Stats */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <DashcoinLogo size={40} />
              </Link>

              {/* Stats Bar - Inline */}
              {dashcStats && (
                <div className="hidden md:block">
                  <DashcStatsBar {...dashcStats} />
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  active={pathname === item.href}
                  external={item.external}
                  highlight={item.highlight}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Stats Bar */}
          {dashcStats && (
            <div className="md:hidden pb-4">
              <DashcStatsBar {...dashcStats} />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-slate-950/95 backdrop-blur-xl border-l border-white/10 p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-white">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  active={pathname === item.href}
                  external={item.external}
                  highlight={item.highlight}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
  external?: boolean;
  highlight?: boolean;
}

function NavLink({ href, active, children, external = false, highlight = false }: NavLinkProps) {
  const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
  
  const stateClasses = active
    ? "bg-blue-600/20 text-white border border-blue-500/30"
    : highlight
    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
    : "text-slate-300 hover:text-white hover:bg-white/10";

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${baseClasses} ${stateClasses} flex items-center gap-1`}
    >
      {children}
      {external && <ExternalLink className="w-3 h-3 opacity-60" />}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, active, children, external = false, highlight = false, onClick }: MobileNavLinkProps) {
  const baseClasses = "flex items-center justify-between w-full p-3 rounded-lg text-sm font-medium transition-all duration-200";
  
  const stateClasses = active
    ? "bg-blue-600/20 text-white border border-blue-500/30"
    : highlight
    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    : "text-slate-300 hover:text-white hover:bg-white/10";

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
    >
      {children}
      {external && <ExternalLink className="w-4 h-4 opacity-60" />}
    </Link>
  );
}