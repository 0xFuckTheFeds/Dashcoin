import { formatCurrency } from "@/lib/utils";
import AnimatedMarketCap from "@/components/animated-marketcap";
import { CopyAddress } from "@/components/copy-address";
import { TrendingUp, ExternalLink, Zap } from "lucide-react";

interface DashcStatsBarProps {
  tradeLink: string;
  marketCap: number;
  contractAddress: string;
}

export function DashcStatsBar({ tradeLink, marketCap, contractAddress }: DashcStatsBarProps) {
  return (
    <div className="group relative">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
      
      {/* Main ticker container */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
        <div className="flex items-center gap-4">
          {/* Token Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white font-bold text-sm">$DASHC</span>
            </div>
            <CopyAddress
              address={contractAddress}
              displayLength={4}
              className="text-slate-400 hover:text-white text-xs"
              iconClassName="text-slate-400 hover:text-white opacity-70 hover:opacity-100"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Market Cap */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Market Cap</div>
              <div className="text-sm font-bold text-white">
                <AnimatedMarketCap value={marketCap} decimals={2} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Trade Button */}
          <a
            href={tradeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Zap className="w-3 h-3" />
            <span>TRADE</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
}

export type { DashcStatsBarProps };