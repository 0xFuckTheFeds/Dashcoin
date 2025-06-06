"use client";

import { DashcoinCard } from "@/components/ui/dashcoin-card";
import Image from "next/image";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import AnimatedMarketCap from "@/components/animated-marketcap";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { valueToScore } from "@/lib/score";
import {
  User, 
  Twitter, 
  Clock, 
  Medal, 
  Package, 
  Layers, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Zap,
  Star,
  Shield,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const checklistIcons: Record<string, JSX.Element> = {
  "Team Doxxed": <User className="h-3 w-3" />,
  "Twitter Activity Level": <Twitter className="h-3 w-3" />,
  "Time Commitment": <Clock className="h-3 w-3" />,
  "Prior Founder Experience": <Medal className="h-3 w-3" />,
  "Product Maturity": <Package className="h-3 w-3" />,
  "Funding Status": <TrendingUp className="h-3 w-3" />,
  "Token-Product Integration Depth": <Layers className="h-3 w-3" />,
  "Social Reach & Engagement Index": <Users className="h-3 w-3" />,
};

const traitCategories: Record<string, string> = {
  "Team Doxxed": "Team",
  "Twitter Activity Level": "Team",
  "Time Commitment": "Team",
  "Prior Founder Experience": "Team",
  "Social Reach & Engagement Index": "Team",
  "Product Maturity": "Product",
  "Token-Product Integration Depth": "Product",
  "Funding Status": "Funding",
};

const traitDescriptions: Record<string, string> = {
  "Team Doxxed": "Verified identities increase community trust in the project",
  "Twitter Activity Level": "Active social accounts signal engaged founders",
  "Time Commitment": "Full-time dedication typically leads to better outcomes",
  "Prior Founder Experience": "Experienced founders handle challenges more easily",
  "Product Maturity": "A mature product lowers execution risk",
  "Funding Status": "External funding can extend runway and credibility",
  "Token-Product Integration Depth": "Live integrations show real utility for the token",
  "Social Reach & Engagement Index": "Larger communities can help drive adoption",
};

function badgeColor(value: any): string {
  if (value === "Unknown" || value === null || value === undefined || value === "") {
    return "bg-slate-600/20 text-slate-300 border-slate-600/30";
  }
  const score = valueToScore(value);
  if (score === 2) return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
  if (score === 1) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
  return num.toString();
}

function getPriceChangeIcon(change: number) {
  if (change > 0) return <ArrowUp className="w-3 h-3" />;
  if (change < 0) return <ArrowDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
}

function getPriceChangeColor(change: number) {
  if (change > 0) return "text-emerald-400";
  if (change < 0) return "text-red-400";
  return "text-slate-400";
}

export interface TokenCardProps {
  token: Record<string, any>;
  researchScore: number | null;
}

export function TokenCard({ token, researchScore }: TokenCardProps) {
  const router = useRouter();
  const tokenAddress = token.token || "";
  const tokenSymbol = token.symbol || "???";
  const change24h = token.change24h || 0;

  const maxTraits = 5;
  const traits = canonicalChecklist.map(label => ({
    label,
    value: (token as any)[label],
    category: traitCategories[label] || "Other",
  }));
  const displayedTraits = traits.slice(0, maxTraits);
  const remainingTraitCount = traits.length - displayedTraits.length;
  const groupedTraits = displayedTraits.reduce<Record<string, { label: string; value: any }[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push({ label: t.label, value: t.value });
    return acc;
  }, {});

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a,button')) {
      return;
    }
    router.push(`/tokendetail/${tokenSymbol}`);
  };

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
      
      {/* Main Card */}
      <DashcoinCard 
        onClick={handleCardClick} 
        className="relative cursor-pointer p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/[0.08]"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <Link href={`/tokendetail/${tokenSymbol}`} className="group/link flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                {token.logoUrl ? (
                  <Image
                    src={token.logoUrl}
                    alt={`${tokenSymbol} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {tokenSymbol.substring(0, 2)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white group-hover/link:text-teal-400 transition-colors truncate">
                    {tokenSymbol}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-all duration-200 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </div>
                {token.name && (
                  <p className="text-sm text-slate-400 truncate">{token.name}</p>
                )}
              </div>
            </div>
          </Link>

          {/* Research Score Badge */}
          {researchScore !== null && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30"></div>
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl">
                <Star className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-bold text-sm">
                  {researchScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Market Data Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Market Cap */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-teal-400" />
                <span className="text-xs text-slate-400 font-medium">Market Cap</span>
              </div>
              <p className="text-white font-bold text-lg">
                ${formatCompactNumber(token.marketCap || 0)}
              </p>
            </div>

            {/* 24h Change */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-xs text-slate-400 font-medium">24h Change</span>
              </div>
              <div className={`flex items-center gap-1 font-bold text-lg ${getPriceChangeColor(change24h)}`}>
                {getPriceChangeIcon(change24h)}
                <span>{Math.abs(change24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Performance Indicator Bar */}
          <div className="relative">
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  change24h > 0 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                    : change24h < 0 
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : 'bg-slate-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.max(Math.abs(change24h) * 2, 5), 100)}%`,
                  marginLeft: change24h < 0 ? 'auto' : '0'
                }}
              />
            </div>
          </div>
        </div>

        {/* Traits Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Research Traits</span>
          </div>

          {Object.entries(groupedTraits).map(([cat, traits]) => (
            <div key={cat} className="space-y-1">
              <p className="text-xs font-medium text-slate-400">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {traits.map(({ label, value }) => (
                  <TooltipProvider delayDuration={0} key={label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-105 ${badgeColor(value)}`}>
                          {checklistIcons[label]}
                          <span>{value || '-'}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-slate-800 border-slate-700">
                        <p className="text-xs">{traitDescriptions[label]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}

          {remainingTraitCount > 0 && (
            <div className="flex items-center px-2 py-1 bg-slate-600/20 border border-slate-600/30 rounded-lg text-xs text-slate-400">
              +{remainingTraitCount} more
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <Link 
            href={`/tokendetail/${tokenSymbol}`} 
            className="group/detail flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
          >
            <span className="text-sm font-medium">View Details</span>
            <ArrowUpRight className="w-3 h-3 group-hover/detail:translate-x-0.5 group-hover/detail:-translate-y-0.5 transition-transform" />
          </Link>

          <a
            href={tokenAddress ? `https://axiom.trade/t/${tokenAddress}/dashc` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group/trade relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              if (!tokenAddress) {
                e.preventDefault();
              }
            }}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">TRADE</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover/trade:opacity-100 transition-opacity" />
          </a>
        </div>
      </DashcoinCard>
    </div>
  );
}