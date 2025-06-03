"use client";

import { useState, useEffect, useMemo } from "react";
import type { TokenData } from "@/types/dune";
import { fetchTokenResearch } from "@/app/actions/googlesheet-action";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  const tokensWithResearch = useMemo(() => {
    return tokens.map(t => {
      const research = researchScores.find(
        r => r.symbol.toUpperCase() === (t.symbol || '').toUpperCase(),
      ) || {};
      return { ...t, ...research };
    });
  }, [tokens, researchScores]);

  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokensWithResearch;
    const term = searchTerm.toLowerCase();
    return tokensWithResearch.filter(t => {
      return (
        (t.symbol && t.symbol.toLowerCase().includes(term)) ||
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    });
  }, [tokensWithResearch, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / pageSize));

  const paginatedTokens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTokens.slice(start, start + pageSize);
  }, [filteredTokens, currentPage, pageSize]);

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

      {paginatedTokens.length === 0 ? (
        <DashcoinCard className="p-8 text-center">No tokens found.</DashcoinCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

