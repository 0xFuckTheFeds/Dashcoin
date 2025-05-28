import { formatCurrency } from "@/lib/utils";
import { CopyAddress } from "@/components/copy-address";

interface DashcStatsBarProps {
  dashcoinCA: string;
  tradeLink: string;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  liquidity: number;
}

export function DashcStatsBar({
  dashcoinCA,
  tradeLink,
  price,
  marketCap,
  volume,
  change24h,
  liquidity,
}: DashcStatsBarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2 bg-dashGreen-dark rounded-lg border border-dashBlack py-2 px-4 w-full md:w-auto">
      <div className="flex items-center gap-2">
        <span className="font-medium text-dashYellow text-sm">$DASHC:</span>
        <CopyAddress
          address={dashcoinCA}
          truncate
          displayLength={6}
          className="text-dashYellow-light hover:text-dashYellow text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="text-center">
          <span className="text-xs opacity-70 font-medium">Price</span>
          <p className="text-sm font-medium">${price.toFixed(price < 0.01 ? 8 : 6)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs opacity-70 font-medium">Market Cap</span>
          <p className="text-sm font-medium">{formatCurrency(marketCap)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs opacity-70 font-medium">24h Volume</span>
          <p className="text-sm font-medium">{formatCurrency(volume)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs opacity-70 font-medium">24h Change</span>
          <p className={`text-sm font-medium ${change24h >= 0 ? "text-dashGreen-accent" : "text-dashRed"}`}>{change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%</p>
        </div>
        <div className="text-center">
          <span className="text-xs opacity-70 font-medium">Liquidity</span>
          <p className="text-sm font-medium">{formatCurrency(liquidity)}</p>
        </div>
      </div>
      <div>
        <a
          href={tradeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-dashYellow text-dashBlack font-medium rounded-md hover:bg-dashYellow-dark transition-colors text-sm flex items-center justify-center border border-dashBlack"
        >
          TRADE
        </a>
      </div>
    </div>
  );
}

export type { DashcStatsBarProps };
