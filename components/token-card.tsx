"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { DashcoinCard } from "@/components/ui/dashcoin-card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { valueToScore } from "@/lib/score";

const checklistIcons: Record<string, JSX.Element> = {
  "Team Doxxed": <Star className="h-3 w-3" />,
  "Twitter Activity Level": <Star className="h-3 w-3" />,
  "Time Commitment": <Star className="h-3 w-3" />,
  "Prior Founder Experience": <Star className="h-3 w-3" />,
  "Product Maturity": <Star className="h-3 w-3" />,
  "Funding Status": <Star className="h-3 w-3" />,
  "Token-Product Integration Depth": <Star className="h-3 w-3" />,
  "Social Reach & Engagement Index": <Star className="h-3 w-3" />,
};

function badgeColor(value: any): string {
  const score = valueToScore(value);
  if (score === 2)
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score === 1) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export interface TokenCardProps {
  token: Record<string, any>;
  researchScore: number | null;
}

export function TokenCard({ token, researchScore }: TokenCardProps) {
  const router = useRouter();
  const tokenAddress = token.token || "";
  const tokenSymbol = token.symbol || "UNKNOWN";
  const change24h = token.change24h || 0;

  /**
   * Clicking anywhere on this wrapper should navigate to /tokendetail/[symbol].
   * We check for modifier keys so that “Ctrl+Click” or right-click→“Open in New Tab” still works.
   */
  const handleRootClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // If user held Ctrl, Cmd, Shift, Alt, or used a non-left button, bail out.
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();
    router.push(`/tokendetail/${tokenSymbol}`);
  };

  /**
   * Any child buttons/anchors must call stopPropagation()
   * so that they don’t trigger handleRootClick.
   */
  return (
    <div
      className="group relative"
      onClick={handleRootClick}
      style={{ cursor: "pointer" }}
    >
      {/* Glow Effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

      <DashcoinCard className="relative p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/[0.08]">
        {/* — HEADER SECTION — */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 mb-2">
            {/* Token Logo or Initials */}
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
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Title + Arrow (hover effect, but NOT a separate <Link>) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white truncate transition-colors group-hover:text-teal-400">
                  {tokenSymbol}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 transition-all duration-200 transform group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              {token.name && (
                <p className="text-sm text-slate-400 truncate">{token.name}</p>
              )}
            </div>
          </div>

          {/* Research Score Badge */}
          {researchScore !== null && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30" />
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl">
                <Star className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-bold text-sm">
                  {researchScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* — MARKET DATA SECTION — */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Market Cap */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-teal-400" />
                <span className="text-xs text-slate-400 font-medium">
                  Market Cap
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                {formatCompactNumber(token.marketCap || 0)}
              </p>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <ArrowUp className="w-3 h-3 text-teal-400" />
                <span className="text-xs text-slate-400 font-medium">Price</span>
              </div>
              <p className="text-white font-bold text-lg">
                ${token.price?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>

          {/* 24h Change + Checklist Badges */}
          <div className="grid grid-cols-2 gap-4">
            {/* 24h Change */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {getPriceChangeIcon(change24h)}
                <span className={`text-xs font-medium ${getPriceChangeColor(change24h)}`}>
                  24h Change
                </span>
              </div>
              <p className={`text-white font-bold text-lg ${getPriceChangeColor(change24h)}`}>
                {change24h.toFixed(2)}%
              </p>
            </div>

            {/* Checklist Badges (up to 6, then “+N more”) */}
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {canonicalChecklist.slice(0, 6).map(({ label, value }) => {
                    return (
                      <Tooltip key={label}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-105 ${badgeColor(
                              value
                            )}`}
                          >
                            {checklistIcons[label]}
                            <span>{value || "-"}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-800 border-slate-700">
                          <p className="text-xs">{label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {canonicalChecklist.length > 6 && (
                    <div className="flex items-center px-2 py-1 bg-slate-600/20 border border-slate-600/30 rounded-lg text-xs text-slate-400">
                      +{canonicalChecklist.length - 6} more
                    </div>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* — ACTION SECTION (Footer) — */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          {/* View Details (purely decorative—clicking the card does the navigation) */}
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400"
            onClick={(e) => {
              // Prevent this button from bubbling up to handleRootClick,
              // but still navigate if someone explicitly “clicks” this button.
              e.stopPropagation();
              router.push(`/tokendetail/${tokenSymbol}`);
            }}
          >
            View Details <ArrowUpRight className="inline w-3 h-3" />
          </button>

          {/* TRADE Button (opens external link) */}
          <button
            type="button"
            className="group/trade relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation(); // Don’t trigger handleRootClick
              if (tokenAddress) {
                window.open(`https://axiom.trade/t/${tokenAddress}/dashc`, "_blank");
              }
            }}
            disabled={!tokenAddress}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">TRADE</span>
          </button>
        </div>
      </DashcoinCard>
    </div>
  );
}

// Re-use these helpers from above (moved to bottom for readability)
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

