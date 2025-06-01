import { DashcoinCard } from "@/components/ui/dashcoin-card"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { formatCurrency0 } from "@/lib/utils"
import { canonicalChecklist } from "@/components/founders-edge-checklist"
import { valueToScore } from "@/lib/score"
import {
  User, Twitter, Clock, Medal, Package, Layers, TrendingUp, Users
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

function badgeColor(value: any): string {
  const score = valueToScore(value)
  if (score === 2) return "bg-green-600 text-white"
  if (score === 1) return "bg-yellow-600 text-black"
  return "bg-gray-600 text-white"
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
    <DashcoinCard className="p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-bold text-dashYellow">{tokenSymbol}</p>
          {token.name && <p className="text-sm opacity-70">{token.name}</p>}
        </div>
        {researchScore !== null && (
          <span className="px-2 py-1 rounded-full bg-blue-600 text-sm font-medium">
            {researchScore.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <p className="opacity-70">Market Cap</p>
          <p>{formatCurrency0(token.marketCap || 0)}</p>
        </div>
        <div className={`text-right ${change24h > 0 ? 'text-green-500' : change24h < 0 ? 'text-red-500' : ''}`}> 
          <p className="opacity-70">24h %</p>
          <p>{change24h.toFixed(2)}%</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-1 text-dashYellow">Traits</p>
        <div className="flex flex-wrap gap-1">
          {canonicalChecklist.map(label => {
            const value = (token as any)[label]
            return (
              <TooltipProvider delayDuration={0} key={label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${badgeColor(value)} text-xs`}>
                      {checklistIcons[label]}
                      <span>{value || '-'}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end mt-auto">
        <a
          href={tokenAddress ? `https://axiom.trade/t/${tokenAddress}/dashc` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-500"
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

