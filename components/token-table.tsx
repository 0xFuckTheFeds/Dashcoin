"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { formatCurrency0 } from "@/lib/utils"
import { DashcoinCard } from "@/components/ui/dashcoin-card"
import {
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  FileSearch,
  Filter,
  FlaskConical,
  Twitter,
  Users,
  User,
  Clock,
  Medal,
  Package,
  Layers,
  TrendingUp,
} from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
// We fetch the full token list from the cached API route and paginate locally
import type { TokenData, PaginatedTokenResponse } from "@/types/dune"
import { CopyAddress } from "@/components/copy-address"
import { batchFetchTokensData } from "@/app/actions/dexscreener-actions"
import { fetchTokenResearch } from "@/app/actions/googlesheet-action"
import { canonicalChecklist } from "@/components/founders-edge-checklist"
import { researchFilterOptions } from "@/data/research-filter-options"
import { useRouter, useSearchParams } from "next/navigation"

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

interface ResearchScoreData {
  symbol: string
  score: number | null
  [key: string]: any 
}

export default function TokenTable({ data }: { data: PaginatedTokenResponse | TokenData[] }) {
  const initialData = Array.isArray(data)
    ? { tokens: data, page: 1, pageSize: 10, totalTokens: data.length, totalPages: Math.ceil(data.length / 10) }
    : data

  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("marketCap")
  const [sortDirection, setSortDirection] = useState("desc")
  const [currentPage, setCurrentPage] = useState(initialData.page || 1)
  const [itemsPerPage, setItemsPerPage] = useState(initialData.pageSize || 10)
  const [isLoading, setIsLoading] = useState(false)
  const [allTokens, setAllTokens] = useState<TokenData[]>(initialData.tokens || [])
  const [tokenData, setTokenData] = useState<PaginatedTokenResponse>(initialData)
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>(initialData.tokens || [])
  const [researchScores, setResearchScores] = useState<ResearchScoreData[]>([])
  const [isLoadingResearch, setIsLoadingResearch] = useState(false)
  const [dexscreenerData, setDexscreenerData] = useState<Record<string, any>>({})
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState(60)
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    symbol: string,
  ) => {
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }

    const target = e.target as HTMLElement
    if (target.closest('a,button')) return

    router.push(`/tokendetail/${symbol}`)
  }

  const [checklistFilters, setChecklistFilters] = useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {}
      canonicalChecklist.forEach(trait => {
        const label = trait.label
        const param = searchParams.get(label)
        initial[label] = param ? param.split('|') : []
      })
      return initial
    }
  )
  const [openChecklistFilter, setOpenChecklistFilter] = useState<string | null>(null)
  const checklistRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openChecklistFilter &&
        checklistRefs.current[openChecklistFilter] &&
        !checklistRefs.current[openChecklistFilter]!.contains(event.target as Node)
      ) {
        setOpenChecklistFilter(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openChecklistFilter])

  useEffect(() => {
    const getResearchScores = async () => {
      setIsLoadingResearch(true);
      try {
        const scores = await fetchTokenResearch();
        setResearchScores(scores);
      } catch (error) {
        console.error("Error fetching research scores:", error);
      } finally {
        setIsLoadingResearch(false);
      }
    };
    
    getResearchScores();
  }, []);

  // Load all tokens from the API and store them locally
  const loadAllTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tokens');
      const tokens = await res.json();
      setAllTokens(Array.isArray(tokens) ? tokens : []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const computeVisibleTokens = useCallback(() => {
    if (!allTokens.length) {
      setFilteredTokens([])
      setTokenData(prev => ({ ...prev, tokens: [], totalTokens: 0, totalPages: 1 }))
      return
    }

    let filtered = [...allTokens]

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((token: any) => {
        const lowerTerm = searchTerm.toLowerCase()
        const symbolMatch =
          token.symbol && typeof token.symbol === "string"
            ? token.symbol.toLowerCase().includes(lowerTerm)
            : false

        const nameMatch =
          token.name && typeof token.name === "string"
            ? token.name.toLowerCase().includes(lowerTerm)
            : false

        const descriptionMatch =
          token.description && typeof token.description === "string"
            ? token.description.toLowerCase().includes(lowerTerm)
            : false

        const addressMatch =
          token.token && typeof token.token === "string"
            ? token.token.toLowerCase().includes(lowerTerm)
            : false

        return symbolMatch || nameMatch || descriptionMatch || addressMatch
      })
    }

    filtered = filtered.filter(token => {
      const research = researchScores.find(
        item => item.symbol.toUpperCase() === (token.symbol || '').toUpperCase()
      )
      return canonicalChecklist.every(trait => {
        const label = trait.label
        const selected = checklistFilters[label]
        if (!selected || selected.length === 0) return true
        let raw = research ? research[label] : ''
        if (raw === undefined || raw === '') raw = 'Unknown'
        return selected.includes(raw as string)
      })
    })

    const sorted = [...filtered].sort((a, b) => {
      let valueA, valueB
      switch (sortField) {
        case 'name':
          valueA = (a.name || '').toString().toLowerCase()
          valueB = (b.name || '').toString().toLowerCase()
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        case 'symbol':
          valueA = (a.symbol || '').toString().toLowerCase()
          valueB = (b.symbol || '').toString().toLowerCase()
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        case 'researchScore':
          const scoreA = getResearchScore(a.symbol || '')
          const scoreB = getResearchScore(b.symbol || '')
          if (scoreA === null && scoreB === null) return 0
          if (scoreA === null) return sortDirection === 'asc' ? -1 : 1
          if (scoreB === null) return sortDirection === 'asc' ? 1 : -1
          return sortDirection === 'asc' ? scoreA! - scoreB! : scoreB! - scoreA!
        case 'change24h':
          valueA = a.change24h || 0
          valueB = b.change24h || 0
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
        case 'marketCap':
        default:
          valueA = a.marketCap || 0
          valueB = b.marketCap || 0
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
      }
    })

    const totalTokens = sorted.length
    const totalPages = Math.max(1, Math.ceil(totalTokens / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const pageTokens = sorted.slice(startIndex, startIndex + itemsPerPage)

    setFilteredTokens(pageTokens)
    setTokenData({
      tokens: pageTokens,
      page: currentPage,
      pageSize: itemsPerPage,
      totalTokens,
      totalPages,
    })
  }, [allTokens, searchTerm, researchScores, checklistFilters, sortField, sortDirection, currentPage, itemsPerPage])

  useEffect(() => {
    computeVisibleTokens()
  }, [computeVisibleTokens])

  useEffect(() => {
    loadAllTokens()
  }, [loadAllTokens])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    canonicalChecklist.forEach(trait => {
      const label = trait.label
      const values = checklistFilters[label]
      if (values && values.length > 0) {
        params.set(label, values.join('|'))
      } else {
        params.delete(label)
      }
    })
    const newQuery = params.toString()
    if (newQuery !== window.location.search.slice(1)) {
      router.replace('?' + newQuery, { scroll: false })
    }
  }, [checklistFilters])


  const fetchDexscreenerData = useCallback(async () => {
    if (!filteredTokens.length) return;
    
    const tokenAddresses = filteredTokens
      .map(token => token.token)
      .filter(address => address && typeof address === "string");
    
    if (tokenAddresses.length === 0) return;
    
    try {
      const dataMap = await batchFetchTokensData(tokenAddresses);
      const newDexData: Record<string, any> = {};
      
      tokenAddresses.forEach(address => {
        const data = dataMap.get(address);

        if (data && data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          newDexData[address] = {
            volume24h: pair.volume?.h24 || 0,
            change24h: pair.priceChange?.h24 || 0,
            changeM5: pair.priceChange?.m5 || 0,
            marketCap: pair.fdv || 0,
          };
        }
      });
      
      setDexscreenerData(newDexData);
      setLastRefreshed(new Date());
      setRefreshCountdown(60);
    } catch (error) {
      console.error("Error fetching Dexscreener data:", error);
    }
  }, [filteredTokens]);

  const getTokenProperty = (token: any, property: string, defaultValue: any = "N/A") => {
    return token && token[property] !== undefined && token[property] !== null ? token[property] : defaultValue
  }
  
    
  const getResearchScore = (tokenSymbol: string): number | null => {
    if (!tokenSymbol) return null;
    
    const normalizedSymbol = tokenSymbol.toUpperCase();
    const scoreData = researchScores.find(item => item.symbol.toUpperCase() === normalizedSymbol);
    return scoreData?.score !== undefined ? scoreData.score : null;
  }

  const tokensWithDexData = [...filteredTokens]
    .map(token => {
      const tokenAddress = getTokenProperty(token, "token", "");
      const dexData = tokenAddress && dexscreenerData[tokenAddress] ? dexscreenerData[tokenAddress] : {};
      const research = researchScores.find(item => item.symbol.toUpperCase() === (token.symbol || '').toUpperCase()) || {};

      return {
        ...token,
        ...dexData,
        ...research,
        marketCap: dexData.marketCap !== undefined ? dexData.marketCap : token.marketCap,
      };
    })
    .sort((a, b) => {
      if (sortField !== 'marketCap') return 0;
      return sortDirection === 'asc'
        ? (a.marketCap || 0) - (b.marketCap || 0)
        : (b.marketCap || 0) - (a.marketCap || 0);
    });

  useEffect(() => {
    if (refreshCountdown <= 0) {
      fetchDexscreenerData();
      return;
    }
    
    const timer = setTimeout(() => {
      setRefreshCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [refreshCountdown, fetchDexscreenerData]);


  // Fetch fresh Dexscreener data whenever the set of tokens changes
  useEffect(() => {
    fetchDexscreenerData();
  }, [filteredTokens, fetchDexscreenerData]);

  useEffect(() => {
    if (searchTerm !== "" && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    computeVisibleTokens();
  }, [currentPage, itemsPerPage, sortField, sortDirection, computeVisibleTokens]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashYellow-light opacity-70" />
          <input
            type="text"
            placeholder="Search tokens or contract addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light placeholder:text-dashYellow-light/50 focus:outline-none focus:ring-2 focus:ring-dashYellow"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light focus:outline-none focus:ring-2 focus:ring-dashYellow"
          >
            <option value="marketCap">Market Cap</option>
            
            <option value="symbol">Token</option>
            <option value="researchScore">Research Score</option>
            <option value="change24h">24h %Gain</option>
         </select>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
            className="px-3 py-2 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light focus:outline-none focus:ring-2 focus:ring-dashYellow"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light focus:outline-none focus:ring-2 focus:ring-dashYellow"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>


      <DashcoinCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashGreen-card dark:bg-dashGreen-cardDark border-b-2 border-dashBlack">
                <th className="text-left py-3 px-4 text-dashYellow cursor-pointer" onClick={() => handleSort("symbol")}>
                  <div className="flex items-center gap-1">Token {renderSortIndicator("symbol")}</div>
                </th>
                <th className="text-left py-3 px-4 text-dashYellow w-[60px]">Actions</th>
                <th
                  className="text-left py-3 px-4 text-dashYellow cursor-pointer"
                  onClick={() => handleSort("marketCap")}
                >
                  <div className="flex items-center gap-1">Market Cap {renderSortIndicator("marketCap")}</div>
                </th>
                <th
                  className="text-left py-3 px-4 text-dashYellow cursor-pointer"
                  onClick={() => handleSort("change24h")}
                >
                  <div className="flex items-center gap-1">24h %Gain {renderSortIndicator("change24h")}</div>
                </th>
                <th
                  className="text-left py-3 px-4 text-dashYellow cursor-pointer"
                  onClick={() => handleSort("researchScore")}
                >
                  <div className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4" />
                    {renderSortIndicator("researchScore")}
                  </div>
                </th>
                {canonicalChecklist.map(({ label, display, description }) => (
                  <th key={label} className="relative text-left py-3 px-4 text-dashYellow">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-pointer">
                            {checklistIcons[label]}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-left">
                          <p className="text-xs font-semibold mb-1">{display}</p>
                          <p className="text-xs opacity-80">{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Filter
                      className="h-5 w-5 ml-1 cursor-pointer inline"
                      onClick={e => {
                        e.stopPropagation()
                        setOpenChecklistFilter(prev => (prev === label ? null : label))
                      }}
                    />
                    {openChecklistFilter === label && (
                      <div
                        ref={el => (checklistRefs.current[label] = el)}
                        className="absolute z-10 left-0 top-full mt-1 bg-dashGreen-dark border border-dashBlack rounded-md p-2 space-y-1"
                      >
                        {researchFilterOptions[label].map(option => (
                          <label key={option} className="flex items-center gap-2 px-2">
                            <input
                              type="checkbox"
                              className="accent-dashYellow"
                              checked={checklistFilters[label]?.includes(option)}
                              onChange={() => {
                                setChecklistFilters(prev => {
                                  const current = prev[label] || []
                                  const exists = current.includes(option)
                                  const next = exists
                                    ? current.filter(v => v !== option)
                                    : [...current, option]
                                  return { ...prev, [label]: next }
                                })
                              }}
                            />
                            {option}
                          </label>
                        ))}
                        <button
                          onClick={() => {
                            setChecklistFilters(prev => ({ ...prev, [label]: [] }))
                            setOpenChecklistFilter(null)
                          }}
                          className="block px-2 py-1 text-sm w-full text-left mt-1 bg-dashGreen-light hover:bg-dashGreen-card"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-dashYellow" />
                      <span>Loading tokens...</span>
                    </div>
                  </td>
                </tr>
              ) : tokensWithDexData.length > 0 ? (
                tokensWithDexData.map((token: any , index: number) => {
                  const tokenAddress = getTokenProperty(token, "token", "")
                  const tokenSymbol = getTokenProperty(token, "symbol", "???")
                  const researchScore = getResearchScore(tokenSymbol)

                  return (
                    <tr
                      key={index}
                      className="border-b border-dashGreen-light odd:bg-neutral-800 even:bg-neutral-900 hover:bg-neutral-700 cursor-pointer"
                      onClick={(e) => handleRowClick(e, tokenSymbol)}
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/tokendetail/${tokenSymbol}`}
                          className="hover:text-dashYellow"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <p className="font-bold">{tokenSymbol}</p>
                            {tokenAddress && (
                              <CopyAddress
                                address={tokenAddress}
                                showBackground={false}
                                className="hidden md:inline text-xs opacity-70 hover:opacity-100"
                              />
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <a
                            href={tokenAddress ? `https://axiom.trade/t/${tokenAddress}/dashc` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-dashGreen text-white font-medium rounded-md hover:shadow transition-colors text-sm min-w-[72px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!tokenAddress) {
                                e.preventDefault()
                              }
                            }}
                          >
                            TRADE
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatCurrency0(getTokenProperty(token, "marketCap", 0))}</td>
                      <td className="py-3 px-4">
                        <div className={`${token.change24h > 0 ? 'text-green-500' : token.change24h < 0 ? 'text-red-500' : ''}`}>
                          {getTokenProperty(token, "change24h", 0).toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isLoadingResearch ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-dashYellow mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : researchScore !== null && researchScore !== undefined ? (
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{researchScore.toFixed(1)}</span>
                            <Link
                              href={`/tokendetail/${tokenSymbol}`}
                              className="hover:text-dashYellow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileSearch className="h-4 w-4" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-dashYellow-light opacity-50">-</span>
                        )}
                      </td>
                      {canonicalChecklist.map(trait => {
                        const label = trait.label
                        const raw = (token as any)[label]
                        const display = raw !== undefined && raw !== '' ? raw : '-'
                        return (
                          <td key={label} className="py-3 px-4">{display}</td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={13} className="py-8 text-center opacity-80">
                    {searchTerm
                      ? "No tokens found matching your search."
                      : "No token data available. Check your Dune query or API key."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashcoinCard>

      <div className="flex justify-between mt-2">
        <div className="text-xs opacity-70 mt-1">
          Last updated: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'} 
          {lastRefreshed && <span> (refreshing in {refreshCountdown}s)</span>}
        </div>
      </div>

      {/* Pagination - Fixed using handlePageChange */}
      {tokenData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm opacity-80">
            Showing page {currentPage} of {tokenData.totalPages} ({tokenData.totalTokens} total tokens)
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
            >
              Previous
            </button>

            {/* Page number buttons */}
            <div className="flex flex-wrap gap-1">
              {generatePageNumbers(currentPage, tokenData.totalPages).map((pageNum) =>
                pageNum === 0 ? (
                  <span key={`ellipsis-${pageNum}`} className="w-8 h-8 flex items-center justify-center">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === pageNum
                        ? "bg-dashYellow text-dashBlack"
                        : "bg-dashGreen-dark border border-dashBlack text-dashYellow-light"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(tokenData.totalPages, currentPage + 1))}
              disabled={currentPage === tokenData.totalPages || isLoading}
              className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(tokenData.totalPages)}
              disabled={currentPage === tokenData.totalPages || isLoading}
              className="px-3 py-1 bg-dashGreen-dark border border-dashBlack rounded-md text-dashYellow-light disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function generatePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: number[] = []

  pages.push(1)

  if (currentPage <= 4) {
    pages.push(2, 3, 4, 5)
    pages.push(0) 
    pages.push(totalPages)
    return pages
  }

  if (currentPage >= totalPages - 3) {
    pages.push(0) 
    pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    return pages
  }

  pages.push(0) 
  pages.push(currentPage - 1, currentPage, currentPage + 1)
  pages.push(0) 
  pages.push(totalPages)

  return pages
}