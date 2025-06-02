"use client"

import { useState, useEffect, useCallback } from "react"
import { batchFetchTokensData } from "@/app/actions/dexscreener-actions"
import { fetchTokenResearch } from "@/app/actions/googlesheet-action"
import type { TokenData, PaginatedTokenResponse } from "@/types/dune"
import { TokenCard } from "./token-card"
import { DashcoinCard } from "@/components/ui/dashcoin-card"
import { Loader2, Search } from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialData.pageSize || 10)

  useEffect(() => {
    const loadResearch = async () => {
      const data = await fetchTokenResearch()
      setResearchScores(data)
    }
    loadResearch()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

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

  const getResearch = (symbol: string): ResearchScoreData | undefined =>
    researchScores.find(r => r.symbol.toUpperCase() === symbol.toUpperCase())

  const filteredTokens = tokens.filter(t => {
    if (searchTerm.trim() === "") return true
    const term = searchTerm.toLowerCase()
    const symbolMatch = t.symbol ? t.symbol.toLowerCase().includes(term) : false
    const nameMatch = t.name ? t.name.toLowerCase().includes(term) : false
    const descriptionMatch = t.description ? t.description.toLowerCase().includes(term) : false
    return symbolMatch || nameMatch || descriptionMatch
  })

  const totalPages = Math.ceil(Math.max(1, filteredTokens.length) / itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTokens = filteredTokens.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    fetchDex(paginatedTokens)
  }, [paginatedTokens, fetchDex])

  const tokensWithData = paginatedTokens.map(t => {
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="relative w-full flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashYellow-light opacity-70" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light placeholder:text-dashYellow-light/50 focus:outline-none focus:ring-2 focus:ring-dashYellow"
          />
        </div>
        <select
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
          className="py-2 px-3 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light"
        >
          <option value={10}>Show 10</option>
          <option value={20}>Show 20</option>
          <option value={50}>Show 50</option>
        </select>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {tokensWithData.map((token, idx) => {
          const researchScore = token.score ?? null
          return (
            <TokenCard key={idx} token={token} researchScore={researchScore} />
          )
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dashYellow-light">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

