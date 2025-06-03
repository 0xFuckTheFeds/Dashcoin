"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { DashcoinButton } from "@/components/ui/dashcoin-button";
import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
} from "@/components/ui/dashcoin-card";
import { DexscreenerChart } from "@/components/dexscreener-chart";
import {
  fetchDexscreenerTokenData,
  getTimeUntilNextDexscreenerRefresh,
} from "@/app/actions/dexscreener-actions";
import { formatCurrency } from "@/lib/utils";
import { CopyAddress } from "@/components/copy-address";

export default function TokenPage({ params }: { params: { symbol: string } }) {
  const tokenAddress = params.symbol; // treat param as address
  const [dexscreenerData, setDexscreenerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dexLastRefresh, setDexLastRefresh] = useState<Date | null>(null);
  const [dexNextRefresh, setDexNextRefresh] = useState<Date | null>(null);
  const [dexTimeRemaining, setDexTimeRemaining] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const dexData = await fetchDexscreenerTokenData(tokenAddress);
        if (!dexData || !dexData.pairs || dexData.pairs.length === 0) {
          notFound();
        }
        setDexscreenerData(dexData.pairs[0]);
        const dexCache = await getTimeUntilNextDexscreenerRefresh(
          `token:${tokenAddress}`,
        );
        if (dexCache.lastRefreshTime) {
          setDexLastRefresh(dexCache.lastRefreshTime);
          setDexNextRefresh(
            new Date(dexCache.lastRefreshTime.getTime() + 5 * 60 * 1000),
          );
          setDexTimeRemaining(dexCache.timeRemaining);
        }
      } catch (error) {
        console.error("Error loading token data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [tokenAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dashYellow-light">Loading token data...</p>
      </div>
    );
  }

  if (!dexscreenerData) {
    notFound();
  }

  const chartAddress = dexscreenerData.pairAddress || tokenAddress;
  const price = Number.parseFloat(dexscreenerData.priceUsd || "0");
  const change24h = dexscreenerData.priceChange?.h24 || 0;
  const volume24h = dexscreenerData.volume?.h24 || 0;
  const liquidity = dexscreenerData.liquidity?.usd || 0;
  const tokenSymbol = dexscreenerData.baseToken?.symbol || "Unknown";
  const tokenName = dexscreenerData.baseToken?.name || tokenSymbol;

  const formattedDexLastRefresh = dexLastRefresh
    ? dexLastRefresh.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : "N/A";
  const formattedDexNextRefresh = dexNextRefresh
    ? dexNextRefresh.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : "N/A";

  return (
    <div className="min-h-screen">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <DashcoinLogo size={48} />
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-dashYellow-light hover:text-dashYellow"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="dashcoin-title text-4xl text-dashYellow">{tokenSymbol}</h1>
            <p className="opacity-80">{tokenName}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={dexscreenerData?.url || `https://axiom.trade/t/${tokenAddress}/dashc`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dashYellow hover:text-dashYellow-dark font-medium dashcoin-text flex items-center"
            >
              Trade
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Price</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">
                ${price.toFixed(price < 0.01 ? 8 : 6)}
              </p>
              <div className="mt-2 pt-2 border-t border-dashGreen-light opacity-50">
                <p className={`text-sm ${change24h >= 0 ? "text-dashGreen-accent" : "text-dashRed"}`}>{change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%</p>
              </div>
            </DashcoinCardContent>
          </DashcoinCard>
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Volume (24h)</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">{formatCurrency(volume24h)}</p>
            </DashcoinCardContent>
          </DashcoinCard>
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Liquidity</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">{formatCurrency(liquidity)}</p>
            </DashcoinCardContent>
          </DashcoinCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Token Details</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Contract Address</span>
                  <CopyAddress
                    address={tokenAddress}
                    showBackground={true}
                    className="text-dashYellow-light hover:text-dashYellow"
                  />
                </div>
                {dexscreenerData?.dexId && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-80">DEX</span>
                    <span className="text-sm">{dexscreenerData.dexId}</span>
                  </div>
                )}
                {dexscreenerData?.pairAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Pair Address</span>
                    <CopyAddress
                      address={dexscreenerData.pairAddress}
                      showBackground={true}
                      className="text-dashYellow-light hover:text-dashYellow"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-dashGreen-light">
                <p className="text-xs opacity-70 mb-1">Data Refresh Information:</p>
                <div className="grid grid-cols-1 gap-2 text-xs opacity-70">
                  <div>
                    <p>DEX data last updated:</p>
                    <p className="font-mono">{formattedDexLastRefresh}</p>
                    <p>Next refresh: {formattedDexNextRefresh}</p>
                  </div>
                </div>
              </div>
            </DashcoinCardContent>
          </DashcoinCard>
        </div>

        {chartAddress && (
          <DexscreenerChart tokenAddress={chartAddress} title="Price Chart" />
        )}
      </main>
      <footer className="container mx-auto py-8 px-4 mt-12 border-t border-dashGreen-light">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <DashcoinLogo size={32} />
          <p className="text-sm opacity-80">© 2025 Dashcoin. All rights reserved.</p>
          <div className="flex gap-4">
            <DashcoinButton variant="outline" size="sm">
              Docs
            </DashcoinButton>
            <DashcoinButton variant="outline" size="sm">
              GitHub
            </DashcoinButton>
          </div>
        </div>
      </footer>
    </div>
  );
}
