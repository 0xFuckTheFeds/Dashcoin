import { DashcoinCard } from "@/components/ui/dashcoin-card"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

import AnimatedMarketCap from "@/components/animated-marketcap"
import { canonicalChecklist } from "@/components/founders-edge-checklist"
import { valueToScore, gradeMaps } from "@/lib/score"
import {
  User,
  Twitter,
  Clock,
  Medal,
  Package,
  Layers,
  TrendingUp,
  Users,
  Award,
} from "lucide-react"
import Link from "next/link"
import { FileSearch } from "lucide-react"

const checklistIcons: Record<string, JSX.Element> = {
  "Team Doxxed": <User className="h-4 w-4" />,
  "Twitter Activity Level": <Twitter className="h-4 w-4" />,
  "Time Commitment": <Clock className="h-4 w-4" />,
  "Prior Founder Experience": <Medal className="h-4 w-4" />,
  "Product Maturity": <Package className="h-4 w-4" />,
  "Funding Status": <TrendingUp className="h-4 w-4" />,
  "Token-Product Integration Depth": <Layers className="h-4 w-4" />,
  "Social Reach & Engagement Index": <Users className="h-4 w-4" />,
}

const shortLabels: Record<string, string> = {
  "Team Doxxed": "Legal Names",
  "Twitter Activity Level": "Twitter",
  "Time Commitment": "Commitment",
  "Prior Founder Experience": "Experience",
  "Product Maturity": "Maturity",
  "Funding Status": "Funding",
  "Token-Product Integration Depth": "Integration",
  "Social Reach & Engagement Index": "Reach",
}

const negativeMap: Record<string, string[]> = {
  "Twitter Activity Level": ["Low"],
  "Time Commitment": ["Abandoned"],
  "Product Maturity": ["Pre-Alpha or N/A"],
  "Social Reach & Engagement Index": ["Low ( < 5 k followers )"],
}

function cellColor(label: string, value: any): string {
  const negatives = negativeMap[label] || []
  if (negatives.includes(String(value))) {
    return "bg-red-600 text-white"
  }
  const score = valueToScore(value, (gradeMaps as any)[label])
  if (score === 2) return "bg-green-600 text-white"
  if (score === 1) return "bg-green-400 text-white"
  return "bg-yellow-500 text-black"
}

function scoreColor(score: number | null): string {
  if (score === null || isNaN(score)) return "bg-yellow-500 text-black"
  if (score >= 70) return "bg-green-600 text-white"
  return "bg-red-600 text-white"
}

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
        <div className="grid grid-cols-3 gap-2">
          {canonicalChecklist.map(label => {
            const value = (token as any)[label]
            return (
              <TooltipProvider delayDuration={0} key={label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`flex flex-col items-center gap-1 p-2 rounded ${cellColor(label, value)} text-xs text-center`}
                    >
                      {checklistIcons[label]}
                      <span>{shortLabels[label]}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{`${label}: ${value || '-'}`}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
          <span
            className={`flex flex-col items-center gap-1 p-2 rounded ${scoreColor(researchScore)} text-xs text-center`}
          >
            <Award className="h-4 w-4" />
            <span>Score</span>
            <span className="text-sm font-semibold">{researchScore !== null ? researchScore.toFixed(1) : '-'}</span>
          </span>
        </div>
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

