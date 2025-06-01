import { DashcoinCard, DashcoinCardContent, DashcoinCardHeader, DashcoinCardTitle } from "@/components/ui/dashcoin-card";
import { formatCurrency0 } from "@/lib/utils";
import { CopyAddress } from "@/components/copy-address";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

interface TokenCardProps {
  token: any;
  research: Record<string, any> | null;
}

function getChecklistColor(value: any) {
  if (value === "Yes" || value === 2 || value === "High" || value === "Full-time (≥ 35 hrs/wk)" || value === "Two or more prior startups" || value === "Revenue-positive / paying customers" || value === "Venture Backed" || value === "Fully live" || value === "High ( ≥ 20 k followers )") {
    return "bg-green-600";
  }
  if (value === "No" || value === 1) {
    return "bg-red-600";
  }
  return "bg-gray-600";
}

export function TokenCard({ token, research }: TokenCardProps) {
  const router = useRouter();
  const tokenAddress = token?.token || "";
  const tokenSymbol = token?.symbol || "???";
  const marketCap = token?.marketCap || 0;
  const change24h = token?.change24h || 0;
  const score = research?.score ?? null;

  return (
    <DashcoinCard className="p-4 flex flex-col justify-between bg-neutral-800 hover:bg-neutral-700 transition-colors">
      <DashcoinCardHeader className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-dashYellow">{tokenSymbol}</h3>
          {tokenAddress && (
            <CopyAddress address={tokenAddress} showBackground={false} className="text-xs opacity-70" />
          )}
        </div>
        {score !== null && (
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-sm font-semibold">
            {Number(score).toFixed(1)}
          </span>
        )}
      </DashcoinCardHeader>
      <DashcoinCardContent className="flex-1 flex flex-col justify-between">
        <div className="mt-2">
          <p className="text-sm opacity-70">Market Cap</p>
          <p className="text-lg font-semibold">{formatCurrency0(marketCap)}</p>
          <p className={change24h >= 0 ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
            {change24h >= 0 ? "▲" : "▼"}{Math.abs(change24h).toFixed(2)}%
          </p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {canonicalChecklist.map((label) => {
            const val = research ? research[label] : null;
            return (
              <TooltipProvider key={label} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`h-2 w-2 rounded-full ${getChecklistColor(val)}`}></span>
                  </TooltipTrigger>
                  <TooltipContent>{label}: {val ?? "?"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <a
            href={tokenAddress ? `https://axiom.trade/t/${tokenAddress}/dashc` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
          >
            TRADE
          </a>
          <button
            onClick={() => router.push(`/tokendetail/${tokenSymbol}`)}
            className="text-sm text-dashYellow hover:text-dashYellow-dark"
          >
            Details
          </button>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  );
}

