"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import type { TokenData } from "@/types/dune";
import {
  fetchTokenResearch,
  fetchCreatorWalletLinks,
} from "@/app/actions/googlesheet-action";
import { batchFetchTokensData } from "@/app/actions/dexscreener-actions";
import { TokenCard } from "./token-card";
import { 
  Loader2, 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Filter, 
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
  Twitter,
  Cookie,
  Wallet,
  Activity,
  DollarSign,
  Users,
  X,
  Zap
} from "lucide-react";
import { formatCurrency0 } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { gradeMaps, valueToScore } from "@/lib/score";
import Link from "next/link";

const toSlug = (name: string = "") =>
  name.toLowerCase().replace(/\s+/g, "-");

interface ResearchScoreData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
  return num.toString();
}

export default function TokenSearchList() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchScores, setResearchScores] = useState<ResearchScoreData[]>([]);
  const [dexscreenerData, setDexscreenerData] = useState<Record<string, any>>({});
  const [walletInfo, setWalletInfo] = useState<Record<string, { walletLink: string; twitter: string }>>({});
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("mc-desc");
  const [showFilter, setShowFilter] = useState(false);
  const [marketCapFilter, setMarketCapFilter] = useState("all");
  const [customMinCap, setCustomMinCap] = useState("");
  const [customMaxCap, setCustomMaxCap] = useState("");

  const fetchDexData = useCallback(async (tokenList: TokenData[]) => {
    const addresses = tokenList.map(t => t.token).filter(Boolean);
    if (!addresses.length) return;
    try {
      const map = await batchFetchTokensData(addresses);
      setDexscreenerData(prev => {
        const updated: Record<string, any> = { ...prev };
        addresses.forEach(addr => {
          const d = map.get(addr);
          if (d && d.pairs && d.pairs.length > 0) {
            const p = d.pairs[0] as any;
            updated[addr] = {
              volume24h: p.volume?.h24 || 0,
              change24h: p.priceChange?.h24 || 0,
              marketCap: p.fdv || 0,
              liquidity: p.liquidity?.usd || 0,
              logoUrl:
                p.baseToken?.imageUrl || p.info?.imageUrl || p.baseToken?.logoURI,
            };
          }
        });
        return updated;
      });
    } catch (err) {
      console.error("Error fetching Dexscreener", err);
    }
  }, []);

  useEffect(() => {
    async function loadTokens() {
      try {
        const res = await fetch("/api/tokens");
        const data = await res.json();
        setTokens(data || []);
      } catch (err) {
        console.error("Error fetching tokens", err);
      } finally {
        setLoading(false);
      }
    }
    loadTokens();
  }, []);

  useEffect(() => {
    const loadResearch = async () => {
      try {
        const data = await fetchTokenResearch();
        setResearchScores(data);
      } catch (err) {
        console.error("Error fetching research data", err);
      }
    };
    loadResearch();
  }, []);

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const data = await fetchCreatorWalletLinks();
        const map: Record<string, { walletLink: string; twitter: string }> = {};
        data.forEach(d => {
          map[d.symbol.toUpperCase()] = {
            walletLink: d.walletLink,
            twitter: d.twitter,
          };
        });
        setWalletInfo(map);
      } catch (err) {
        console.error("Error fetching wallet links", err);
      }
    };
    loadWallets();
  }, []);

  const tokensWithData = useMemo(() => {
    return tokens.map(t => {
      const sym = (t.symbol || '').toUpperCase();
      const research =
        researchScores.find(r => r.symbol.toUpperCase() === sym) || {};
      const dex = dexscreenerData[t.token] || {};
      const wallet = walletInfo[sym] || { walletLink: '', twitter: '' };
      return {
        ...t,
        ...dex,
        ...research,
        ...wallet,
        marketCap: dex.marketCap ?? t.marketCap,
        logoUrl: dex.logoUrl,
      };
    });
  }, [tokens, researchScores, dexscreenerData, walletInfo]);

  const filteredAndSortedTokens = useMemo(() => {
    let result = tokensWithData;

    // text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => {
        return (
          (t.symbol && t.symbol.toLowerCase().includes(term)) ||
          (t.name && t.name.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term)) ||
          (t.token && t.token.toLowerCase().includes(term))
        );
      });
    }

    // market cap filter
    result = result.filter(t => {
      const cap = t.marketCap || 0;
      switch (marketCapFilter) {
        case "above5m":
          return cap >= 5_000_000;
        case "1to5m":
          return cap >= 1_000_000 && cap < 5_000_000;
        case "500kto1m":
          return cap >= 500_000 && cap < 1_000_000;
        case "100kto500k":
          return cap >= 100_000 && cap < 500_000;
        case "custom":
          const min = customMinCap ? Number(customMinCap) : 0;
          const max = customMaxCap ? Number(customMaxCap) : Infinity;
          return cap >= min && cap <= max;
        default:
          return true;
      }
    });

    // sorting
    if (sortOption === "mc-desc") {
      result = [...result].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    } else if (sortOption === "mc-asc") {
      result = [...result].sort((a, b) => (a.marketCap || 0) - (b.marketCap || 0));
    } else if (sortOption === "rs-desc") {
      result = [...result].sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortOption === "change-desc") {
      result = [...result].sort((a, b) => (b.change24h || 0) - (a.change24h || 0));
    }

    return result;
  }, [tokensWithData, searchTerm, sortOption, marketCapFilter, customMinCap, customMaxCap]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTokens.length / pageSize));

  const paginatedTokens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTokens.slice(start, start + pageSize);
  }, [filteredAndSortedTokens, currentPage, pageSize]);

  // Only refetch Dexscreener data when the set of token addresses changes
  const paginatedTokenKey = useMemo(
    () => paginatedTokens.map((t) => t.token).join(','),
    [paginatedTokens],
  );

  useEffect(() => {
    fetchDexData(paginatedTokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedTokenKey, fetchDexData]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getSortIcon = (option: string) => {
    if (sortOption !== option) return <ArrowUpDown className="w-4 h-4" />;
    return option.includes('desc') ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-teal-400" />
          <p className="text-slate-300 text-lg">Loading token data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Token Directory</h2>
            <p className="text-slate-400">
              {filteredAndSortedTokens.length} tokens found
              {searchTerm && (
                <span className="ml-2 px-2 py-1 bg-teal-500/20 text-teal-300 rounded text-sm">
                  for "{searchTerm}"
                </span>
              )}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'card' 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'table' 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by token symbol, name, description, or contract address..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={e => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
            >
              <option value="mc-desc" className="bg-slate-800">Market Cap: High to Low</option>
              <option value="mc-asc" className="bg-slate-800">Market Cap: Low to High</option>
              <option value="rs-desc" className="bg-slate-800">Research Score: High to Low</option>
              <option value="change-desc" className="bg-slate-800">24h Change: High to Low</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-200 ${
                marketCapFilter !== 'all' ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {marketCapFilter !== 'all' && (
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-xl p-4 space-y-3 z-20 min-w-[200px] shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Market Cap Filter</h4>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {[
                  { value: "all", label: "All Tokens" },
                  { value: "above5m", label: "Above $5M" },
                  { value: "1to5m", label: "$1M – $5M" },
                  { value: "500kto1m", label: "$500K – $1M" },
                  { value: "100kto500k", label: "$100K – $500K" }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      value={option.value}
                      checked={marketCapFilter === option.value}
                      onChange={e => {
                        setMarketCapFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-teal-600 border-slate-500 focus:ring-teal-500"
                    />
                    <span className="text-slate-300 group-hover:text-white text-sm">
                      {option.label}
                    </span>
                  </label>
                ))}

                <div className="pt-3 mt-1 border-t border-white/10 space-y-2">
                  <label className="text-slate-300 text-sm">Custom Range ($)</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={customMinCap}
                      onChange={e => setCustomMinCap(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="" className="bg-slate-800">Min</option>
                      <option value="50000" className="bg-slate-800">50K</option>
                      <option value="100000" className="bg-slate-800">100K</option>
                      <option value="250000" className="bg-slate-800">250K</option>
                      <option value="500000" className="bg-slate-800">500K</option>
                      <option value="1000000" className="bg-slate-800">1M</option>
                      <option value="3000000" className="bg-slate-800">3M</option>
                      <option value="5000000" className="bg-slate-800">5M</option>
                      <option value="10000000" className="bg-slate-800">10M</option>
                      <option value="25000000" className="bg-slate-800">25M</option>
                    </select>
                    <span className="text-slate-300">-</span>
                    <select
                      value={customMaxCap}
                      onChange={e => setCustomMaxCap(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="" className="bg-slate-800">Max</option>
                      <option value="50000" className="bg-slate-800">50K</option>
                      <option value="100000" className="bg-slate-800">100K</option>
                      <option value="250000" className="bg-slate-800">250K</option>
                      <option value="500000" className="bg-slate-800">500K</option>
                      <option value="1000000" className="bg-slate-800">1M</option>
                      <option value="3000000" className="bg-slate-800">3M</option>
                      <option value="5000000" className="bg-slate-800">5M</option>
                      <option value="10000000" className="bg-slate-800">10M</option>
                      <option value="25000000" className="bg-slate-800">25M</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setMarketCapFilter('custom');
                      setCurrentPage(1);
                      setShowFilter(false);
                    }}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={12} className="bg-slate-800">12 per page</option>
            <option value={24} className="bg-slate-800">24 per page</option>
            <option value={48} className="bg-slate-800">48 per page</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      {paginatedTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-slate-600/20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tokens found</h3>
          <p className="text-slate-400 text-center max-w-md">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedTokens.map((token, idx) => (
            <TokenCard key={idx} token={token} researchScore={token.score ?? null} />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Token
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Market Cap
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      24h Change
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Research
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Links</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTokens.map((token, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/tokendetail/${token.symbol}`} className="flex items-center gap-3 group-hover:text-teal-400 transition-colors">
                        {token.logoUrl ? (
                          <Image
                            src={token.logoUrl}
                            alt={`${token.symbol} logo`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {(token.symbol || '').substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white">{token.symbol}</div>
                          {token.name && (
                            <div className="text-xs text-slate-400 truncate max-w-[150px]">{token.name}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">
                        ${formatCompactNumber(token.marketCap || 0)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1 font-bold ${
                        (token.change24h || 0) > 0 ? 'text-emerald-400' : 
                        (token.change24h || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {(token.change24h || 0) > 0 ? <TrendingUp className="w-3 h-3" /> : 
                         (token.change24h || 0) < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                        {Math.abs(token.change24h || 0).toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {token.score !== undefined && token.score !== null ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg w-fit cursor-pointer">
                                <Star className="w-3 h-3" />
                                <span className="font-bold">{token.score.toFixed(1)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-left max-w-xs">
                              <ul className="space-y-1">
                                {canonicalChecklist.map(({ label, display }) => {
                                  const raw = (token as any)[label]
                                  const val = valueToScore(raw, (gradeMaps as any)[label])
                                  const displayVal = val * 6
                                  return (
                                    <li key={label} className="flex justify-between gap-2">
                                      <span>{display}</span>
                                      <span className="font-semibold">+{displayVal}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {token.token && (
                          <a
                            href={`https://axiom.trade/t/${token.token}/dashc`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white text-xs font-semibold rounded-lg transition-all"
                            title="Trade"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Trade</span>
                          </a>
                        )}
                        {token.walletLink && (
                          <a
                            href={token.walletLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group/btn"
                            title="Creator Wallet"
                          >
                            <Wallet className="w-4 h-4 text-slate-400 group-hover/btn:text-white" />
                          </a>
                        )}
                        {token.twitter && (
                          <a
                            href={`${token.twitter.startsWith('http') ? token.twitter : `https://twitter.com/${token.twitter.replace('@','')}`}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group/btn"
                            title="Twitter"
                          >
                            <Twitter className="w-4 h-4 text-slate-400 group-hover/btn:text-teal-400" />
                          </a>
                        )}
                        <a
                          href={`https://www.cookie.fun/tokens/${toSlug(token.name || token.symbol)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group/btn"
                          title="View on Cookie.fun"
                        >
                          <Cookie className="w-4 h-4 text-slate-400 group-hover/btn:text-teal-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedTokens.length)} of {filteredAndSortedTokens.length} tokens
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-teal-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}