"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { DashcoinLogo } from "@/components/dashcoin-logo";

import { 
  Menu, 
  X, 
  ExternalLink, 
  BarChart3, 
  GitCompare, 
  Wallet, 
  MessageCircle, 
  BookOpen, 
  Users 
} from "lucide-react";

export function Navbar() {
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
    { href: "/", label: "Overview", icon: BarChart3 },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/creator-wallets", label: "Wallets", icon: Wallet },
    { href: "/founder-interviews", label: "Interviews", icon: MessageCircle },
    { href: "https://dashcoin-research.gitbook.io/dashcoin-research", label: "Guide", icon: BookOpen, external: true },
    { href: "https://dashcoin-research-tg-gated.vercel.app/", label: "Dashcoin Holder Alpha Group", icon: Users, external: true, highlight: true }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg' 
            : 'bg-slate-950'
        }`}
      >
        <div className="max-w-9xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <DashcoinLogo size={40} />
              </Link>

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
                  icon={item.icon}
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
                  icon={item.icon}
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
  icon: React.ComponentType<{ className?: string }>;
}

function NavLink({ href, active, children, external = false, highlight = false, icon: Icon }: NavLinkProps) {
  const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
  
  const stateClasses = active
    ? "bg-teal-600/20 text-white border border-teal-500/30"
    : highlight
    ? "bg-gradient-to-r from-teal-600 to-green-600 text-white hover:from-teal-500 hover:to-green-500"
    : "text-slate-300 hover:text-white hover:bg-white/10";

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${baseClasses} ${stateClasses} flex items-center gap-2`}
    >
      <Icon className="w-4 h-4" />
      {children}
      {external && <ExternalLink className="w-3 h-3 opacity-60" />}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, active, children, external = false, highlight = false, icon: Icon, onClick }: MobileNavLinkProps) {
  const baseClasses = "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all duration-200";
  
  const stateClasses = active
    ? "bg-teal-600/20 text-white border border-teal-500/30"
    : highlight
    ? "bg-gradient-to-r from-teal-600 to-green-600 text-white"
    : "text-slate-300 hover:text-white hover:bg-white/10";

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1">{children}</span>
      {external && <ExternalLink className="w-4 h-4 opacity-60" />}
    </Link>
  );
}