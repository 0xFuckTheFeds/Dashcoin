import { formatCurrency } from "@/lib/utils";
import AnimatedMarketCap from "@/components/animated-marketcap";
import { CopyAddress } from "@/components/copy-address";
import { TrendingUp, ExternalLink, Zap } from "lucide-react";

interface DashcStatsBarProps {
  tradeLink: string;
  marketCap: number;
  contractAddress: string;
}

// Utility function to format large numbers
function formatCompactNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(0) + 'K';
  }
  return num.toString();
}

export function DashcStatsBar({ tradeLink, marketCap, contractAddress }: DashcStatsBarProps) {
  return (
    <div className="group relative max-w-fit mx-auto">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
      
      {/* Main ticker container - More compact */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
        <div className="flex items-center gap-3">
          {/* Token Info - Compact */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white font-bold text-xs">$DASHC</span>
            </div>
            <CopyAddress
              address={contractAddress}
              displayLength={4}
              className="text-slate-400 hover:text-white text-xs"
              iconClassName="text-slate-400 hover:text-white opacity-70 hover:opacity-100 w-3 h-3"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/10" />

          {/* Market Cap - Compact */}
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <div className="text-center">
              <div className="text-xs font-bold text-white leading-none">
                ${formatCompactNumber(marketCap)}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/10" />

          {/* Trade Button - Compact */}
          <a
            href={tradeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Zap className="w-3 h-3" />
            <span>TRADE</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
}

export type { DashcStatsBarProps };