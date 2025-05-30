import { formatCurrency } from "@/lib/utils";

interface DashcStatsBarProps {
  tradeLink: string;
  marketCap: number;
}

export function DashcStatsBar({ tradeLink, marketCap }: DashcStatsBarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-1 bg-dashGreen-dark rounded-lg border border-dashBlack py-1 px-2 w-full md:w-auto text-xs">
      <div className="flex items-center gap-1">
        <span className="font-medium text-dashYellow">$DASHC</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="text-center">
          <span className="opacity-70 font-medium">Market Cap</span>
          <p className="font-medium">{formatCurrency(marketCap)}</p>
        </div>
      </div>
      <div>
        <a
          href={tradeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 bg-dashYellow text-dashBlack font-medium rounded-md hover:bg-dashYellow-dark transition-colors flex items-center justify-center border border-dashBlack"
        >
          TRADE
        </a>
      </div>
    </div>
  );
}

export type { DashcStatsBarProps };
