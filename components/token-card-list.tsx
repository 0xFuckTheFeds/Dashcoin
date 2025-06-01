"use client";

import { useState, useEffect } from "react";
import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { TokenCard } from "@/components/token-card";
import { fetchTokenResearch } from "@/app/actions/googlesheet-action";
import type { TokenData, PaginatedTokenResponse } from "@/types/dune";
import { fetchPaginatedTokens } from "@/app/actions/dune-actions";
import { Input } from "@/components/ui/input";

interface ResearchScoreData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

export default function TokenCardList({ data }: { data: PaginatedTokenResponse | TokenData[] }) {
  const initialData = Array.isArray(data)
    ? { tokens: data, page: 1, pageSize: 10, totalTokens: data.length, totalPages: Math.ceil(data.length / 10) }
    : data;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("marketCap");
  const [sortDirection, setSortDirection] = useState("desc");
  const [tokens, setTokens] = useState<TokenData[]>(initialData.tokens || []);
  const [researchScores, setResearchScores] = useState<ResearchScoreData[]>([]);

  useEffect(() => {
    const getResearchScores = async () => {
      try {
        const scores = await fetchTokenResearch();
        setResearchScores(scores);
      } catch (err) {
        console.error("Error fetching research scores", err);
      }
    };
    getResearchScores();
  }, []);

  useEffect(() => {
    async function fetchPage() {
      try {
        const resp = await fetchPaginatedTokens(1, 20, sortField, sortDirection, searchTerm);
        setTokens(resp.tokens);
      } catch (err) {
        console.error("error fetching tokens", err);
      }
    }
    fetchPage();
  }, [searchTerm, sortField, sortDirection]);

  const getResearch = (symbol: string) => researchScores.find(r => r.symbol.toUpperCase() === symbol.toUpperCase()) || null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Search tokens"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          className="bg-neutral-800 border border-neutral-600 rounded-md px-2 text-sm"
          value={sortField}
          onChange={e => setSortField(e.target.value)}
        >
          <option value="marketCap">Market Cap</option>
          <option value="researchScore">Research Score</option>
        </select>
        <select
          className="bg-neutral-800 border border-neutral-600 rounded-md px-2 text-sm"
          value={sortDirection}
          onChange={e => setSortDirection(e.target.value)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      {tokens.length === 0 ? (
        <DashcoinCard className="p-8 text-center">No tokens found</DashcoinCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map(token => (
            <TokenCard key={token.symbol} token={token} research={getResearch(token.symbol || "")} />
          ))}
        </div>
      )}
    </div>
  );
}

