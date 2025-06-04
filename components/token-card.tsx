import { DashcoinCard } from "@/components/ui/dashcoin-card"

import AnimatedMarketCap from "@/components/animated-marketcap"
import { TraitsRadarChart } from "./traits-radar-chart"
import Link from "next/link"
import { FileSearch } from "lucide-react"

export interface TokenCardProps {
  token: Record<string, any>
  researchScore: number | null
}

export function TokenCard({ token, researchScore }: TokenCardProps) {
  const tokenAddress = token.token || ""
  const tokenSymbol = token.symbol || "???"
  const change24h = token.change24h || 0

  return (
    <DashcoinCard className="token-card p-8 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <Link href={`/tokendetail/${tokenSymbol}`} className="hover:text-dashYellow">
          <div>
            <p className="text-2xl font-bold text-dashYellow">{tokenSymbol}</p>
            {token.name && (
              <p className="text-lg text-dashYellow-light">{token.name}</p>
            )}
          </div>
        </Link>
        {researchScore !== null && (
          <span className="px-3 py-1 rounded-full bg-dashGreen text-white text-base font-medium">
            {researchScore.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between text-base">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-dashYellow-light">Market Cap</p>
            <p className="font-bold text-dashYellow">
              <AnimatedMarketCap value={token.marketCap || 0} />
            </p>
          </div>
          <span className="opacity-50">|</span>
          <div className={`${change24h > 0 ? 'text-green-600' : change24h < 0 ? 'text-red-500' : ''}`}> 
            <p className="text-dashYellow-light">24h %</p>
            <p className={`font-bold ${change24h === 0 ? 'text-dashYellow' : ''}`}>{change24h.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-base font-medium mb-2 text-dashYellow">Traits</p>
        <TraitsRadarChart token={token} />
      </div>

        <div className="flex justify-end mt-auto">
          <a
            href={tokenAddress ? `https://axiom.trade/t/${tokenAddress}/dashc` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-dashGreen text-white rounded-md text-base hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashGreen-dark"
          >
            TRADE
          </a>
          <Link href={`/tokendetail/${tokenSymbol}`} className="ml-2 text-dashYellow hover:text-dashYellow-dark flex items-center">
            <FileSearch className="h-4 w-4" />
        </Link>
      </div>
    </DashcoinCard>
  )
}

