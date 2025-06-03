"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { TokenData } from "@/types/dune";
import { fetchTokenResearch } from "@/app/actions/googlesheet-action";
import { batchFetchTokensData } from "@/app/actions/dexscreener-actions";
import { TokenCard } from "./token-card";
import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { Loader2 } from "lucide-react";

interface ResearchScoreData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

export default function TokenSearchList() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchScores, setResearchScores] = useState<ResearchScoreData[]>([]);
  const [dexscreenerData, setDexscreenerData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("mc-desc");
  const [showFilter, setShowFilter] = useState(false);
  const [marketCapFilter, setMarketCapFilter] = useState("all");
  const fetchDexData = useCallback(async (tokenList: TokenData[]) => {
    const addresses = tokenList.map(t => t.token).filter(Boolean);
    if (!addresses.length) return;
    try {
      const map = await batchFetchTokensData(addresses);
      const result: Record<string, any> = {};
      addresses.forEach(addr => {
        const d = map.get(addr);
        if (d && d.pairs && d.pairs.length > 0) {
          const p = d.pairs[0];
          result[addr] = {
            volume24h: p.volume?.h24 || 0,
            change24h: p.priceChange?.h24 || 0,
            marketCap: p.fdv || 0,
          };
        }
      });
      setDexscreenerData(result);
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
        fetchDexData(data || []);
      } catch (err) {
        console.error("Error fetching tokens", err);
      } finally {
        setLoading(false);
      }
    }
    loadTokens();
  }, [fetchDexData]);


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

  const tokensWithData = useMemo(() => {
    return tokens.map(t => {
      const research = researchScores.find(
        r => r.symbol.toUpperCase() === (t.symbol || '').toUpperCase(),
      ) || {};
      const dex = dexscreenerData[t.token] || {};
      return {
        ...t,
        ...dex,
        ...research,
        marketCap: dex.marketCap ?? t.marketCap,
      };
    });
  }, [tokens, researchScores, dexscreenerData]);

  const filteredAndSortedTokens = useMemo(() => {
    let result = tokensWithData;

    // text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => {
        return (
          (t.symbol && t.symbol.toLowerCase().includes(term)) ||
          (t.name && t.name.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term))
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
  }, [tokensWithData, searchTerm, sortOption, marketCapFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTokens.length / pageSize));

  const paginatedTokens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTokens.slice(start, start + pageSize);
  }, [filteredAndSortedTokens, currentPage, pageSize]);

  useEffect(() => {
    fetchDexData(paginatedTokens);
  }, [paginatedTokens, fetchDexData]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <DashcoinCard className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-5 w-5" />
      </DashcoinCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md text-dashYellow-light focus:outline-none"
        />
        <div className="flex gap-2 items-center">
          <label className="text-sm text-dashYellow-light" htmlFor="sort-select">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={e => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-dashYellow-light focus:outline-none"
          >
            <option value="mc-desc">Market Cap: High to Low</option>
            <option value="rs-desc">Research Score: High to Low</option>
            <option value="change-desc">24h % Change: High to Low</option>
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter(p => !p)}
              className="px-9 py-2 bg-white border border-gray-300 rounded-md text-dashYellow-light focus:outline-none"
            >
              Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md p-2 space-y-1 z-10 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="all"
                    checked={marketCapFilter === 'all'}
                    onChange={e => {
                      setMarketCapFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  All
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="above5m"
                    checked={marketCapFilter === 'above5m'}
                    onChange={e => {
                      setMarketCapFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  Above $5M
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="1to5m"
                    checked={marketCapFilter === '1to5m'}
                    onChange={e => {
                      setMarketCapFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  $1M – $5M
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="500kto1m"
                    checked={marketCapFilter === '500kto1m'}
                    onChange={e => {
                      setMarketCapFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  $500K – $1M
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="100kto500k"
                    checked={marketCapFilter === '100kto500k'}
                    onChange={e => {
                      setMarketCapFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  $100K – $500K
                </label>
              </div>
            )}
          </div>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-dashYellow-light focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {paginatedTokens.length === 0 ? (
        <DashcoinCard className="p-8 text-center">No tokens found.</DashcoinCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto px-4 sm:px-8 lg:px-[20%]">
          {paginatedTokens.map((token, idx) => (
            <TokenCard
              key={idx}
              token={token}
              researchScore={token.score ?? null}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-dashGreen text-white rounded-md disabled:opacity-50 hover:shadow"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm text-dashYellow-light">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-dashGreen text-white rounded-md disabled:opacity-50 hover:shadow"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

