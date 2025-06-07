"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Wallet, AlertCircle, Activity, Clock, ArrowUpRight } from "lucide-react";

interface TokenWalletInfo {
  name: string;
  symbol: string;
  tokenUrl: string;
  walletLink: string;
  walletActivity: string;
}

export function CreatorWalletList({ tokens }: { tokens: TokenWalletInfo[] }) {
  const [sort, setSort] = useState<"trending" | "active">("trending");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const sortedTokens = useMemo(() => {
    const arr = [...tokens];
    if (sort === "active") {
      arr.sort(
        (a, b) =>
          (b.walletActivity ? b.walletActivity.length : 0) -
          (a.walletActivity ? a.walletActivity.length : 0)
      );
    }
    return arr;
  }, [tokens, sort]);

  const totalPages = Math.ceil(sortedTokens.length / pageSize) || 1;
  const pageTokens = sortedTokens.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        <label htmlFor="sort" className="text-sm text-slate-400">
          Sort:
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as "trending" | "active");
            setPage(1);
          }}
          className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white backdrop-blur-xl"
        >
          <option value="trending">Trending</option>
          <option value="active">Most Active</option>
        </select>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {pageTokens.map((token, index) => (
          <div
            key={`${token.symbol}-${index}`}
            className="group px-8 py-6 hover:bg-white/[0.02] transition-all duration-200"
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {token.tokenUrl ? (
                      <Image
                        src={token.tokenUrl}
                        alt={`${token.symbol} logo`}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      token.symbol.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg tracking-tight">
                      {token.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                {token.walletLink ? (
                  <a
                    href={token.walletLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-3 px-4 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/30 rounded-xl text-teal-400 hover:text-teal-300 transition-all duration-200 font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>View Wallet</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-500/5 border border-slate-500/10 rounded-xl text-slate-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>No wallet linked</span>
                  </div>
                )}
              </div>
              <div className="col-span-4">
                {token.walletActivity ? (
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <Activity className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {token.walletActivity}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-500/5 border border-slate-500/10 rounded-xl text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">No recent activity</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-4 py-6">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}
