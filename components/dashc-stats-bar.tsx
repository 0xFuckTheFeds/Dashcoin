import { formatCurrency } from "@/lib/utils";
import AnimatedMarketCap from "@/components/animated-marketcap";
import { CopyAddress } from "@/components/copy-address";

interface DashcStatsBarProps {
  tradeLink: string;
  marketCap: number;
  contractAddress: string;
}

export function DashcStatsBar({ tradeLink, marketCap, contractAddress }: DashcStatsBarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-1 bg-dashGreen-light text-dashBlack rounded-lg border border-dashGreen-dark py-1 px-2 w-full md:w-auto text-xs shadow-sm">
      <div className="flex items-center gap-1">
        <span className="font-semibold">$DASHC</span>
        <CopyAddress
          address={contractAddress}
          displayLength={4}
          className="text-dashBlack"
          iconClassName="text-dashBlack opacity-70 hover:opacity-100"
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="text-center">
          <span className="opacity-70 font-medium">Market Cap</span>
          <p className="font-medium">
            <AnimatedMarketCap value={marketCap} decimals={2} />
          </p>
        </div>
      </div>
      <div>
        <a
          href={tradeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 bg-dashGreen text-white font-medium rounded-md hover:brightness-110 transition-colors flex items-center justify-center border border-dashGreen-dark"
        >
          TRADE
        </a>
      </div>
    </div>
  );
}

export type { DashcStatsBarProps };
