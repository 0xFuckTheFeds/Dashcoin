"use client"

import { useState, useEffect, useCallback } from "react"
import { batchFetchTokensData } from "@/app/actions/dexscreener-actions"
import { fetchTokenResearch } from "@/app/actions/googlesheet-action"
import type { TokenData, PaginatedTokenResponse } from "@/types/dune"
import { TokenCard } from "./token-card"
import { DashcoinCard } from "@/components/ui/dashcoin-card"
import { Loader2 } from "lucide-react"

interface ResearchScoreData {
  symbol: string
  score: number | null
  [key: string]: any
}

export default function TokenCardList({ data }: { data: PaginatedTokenResponse | TokenData[] }) {
  const initialData = Array.isArray(data)
    ? { tokens: data, page: 1, pageSize: 10, totalTokens: data.length, totalPages: Math.ceil(data.length / 10) }
    : data

  const [tokens, setTokens] = useState<TokenData[]>(initialData.tokens || [])
  const [researchScores, setResearchScores] = useState<ResearchScoreData[]>([])
  const [dexscreenerData, setDexscreenerData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadResearch = async () => {
      const data = await fetchTokenResearch()
      setResearchScores(data)
    }
    loadResearch()
  }, [])

  const fetchDex = useCallback(async (tokens: TokenData[]) => {
    const addresses = tokens.map(t => t.token).filter(Boolean)
    if (!addresses.length) return
    try {
      const map = await batchFetchTokensData(addresses)
      const result: Record<string, any> = {}
      addresses.forEach(addr => {
        const d = map.get(addr)
        if (d && d.pairs && d.pairs.length > 0) {
          const p = d.pairs[0]
          result[addr] = {
            volume24h: p.volume?.h24 || 0,
            change24h: p.priceChange?.h24 || 0,
            marketCap: p.fdv || 0,
          }
        }
      })
      setDexscreenerData(result)
    } catch (err) {
      console.error("Error fetching Dexscreener", err)
    }
  }, [])

  useEffect(() => {
    fetchDex(tokens)
  }, [tokens, fetchDex])

  const getResearch = (symbol: string): ResearchScoreData | undefined =>
    researchScores.find(r => r.symbol.toUpperCase() === symbol.toUpperCase())

  const tokensWithData = tokens.map(t => {
    const dex = dexscreenerData[t.token] || {}
    const research = getResearch(t.symbol || "") || {}
    return { ...t, ...dex, ...research, marketCap: dex.marketCap ?? t.marketCap }
  })

  if (isLoading && tokensWithData.length === 0) {
    return (
      <DashcoinCard className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-5 w-5" />
      </DashcoinCard>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {tokensWithData.map((token, idx) => {
        const researchScore = token.score ?? null
        return <TokenCard key={idx} token={token} researchScore={researchScore} />
      })}
    </div>
  )
}

