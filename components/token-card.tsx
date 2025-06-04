import { DashcoinCard } from "@/components/ui/dashcoin-card"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { formatCurrency0 } from "@/lib/utils"
import { canonicalChecklist } from "@/components/founders-edge-checklist"
import { valueToScore } from "@/lib/score"
import {
  User,
  Twitter,
  Clock,
  Medal,
  Package,
  Layers,
  TrendingUp,
  Users,
  Link as LinkIcon,
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
  "Data Integration": <LinkIcon className="h-4 w-4" />,
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
              {formatCurrency0(token.marketCap || 0)}
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
        <div className="flex flex-wrap gap-1.5">
          {canonicalChecklist.map(label => {
            const value = (token as any)[label]
            return (
              <TooltipProvider delayDuration={0} key={label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${badgeColor(value)} text-sm`}>
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

