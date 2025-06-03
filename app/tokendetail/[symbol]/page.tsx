"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Twitter } from "lucide-react";
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
import { FoundersEdgeChecklist } from "@/components/founders-edge-checklist";

interface TokenResearchData {
  [key: string]: any;
}

async function fetchTokenResearch(tokenSymbol: string): Promise<TokenResearchData | null> {
  const API_KEY = "AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk";
  const SHEET_ID = "1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0";
  const SHEET_NAME = "Dashcoin Scoring";
  const RANGE = `${SHEET_NAME}!A1:T200`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
      console.warn("No data found in Google Sheet");
      return null;
    }

    const [header, ...rows] = data.values;
    const structured = rows.map((row: any) => {
      const entry: Record<string, any> = {};
      header.forEach((key: string, i: number) => {
        entry[key.trim()] = row[i] || "";
      });
      return entry;
    });

    const normalizedSymbol = tokenSymbol.toUpperCase();
    const tokenData = structured.find((entry: any) => {
      return (
        entry["Project"] &&
        entry["Project"].toString().toUpperCase() === normalizedSymbol &&
        entry["Score"]
      );
    });

    return tokenData || null;
  } catch (err) {
    console.error("Google Sheets API error:", err);
    return null;
  }
}

export default function TokenResearchPage({ params }: { params: { symbol: string } }) {
  const tokenAddress = params.symbol;
  const [dexscreenerData, setDexscreenerData] = useState<any>(null);
  const [researchData, setResearchData] = useState<TokenResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dexLastRefresh, setDexLastRefresh] = useState<Date | null>(null);
  const [dexNextRefresh, setDexNextRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dex = await fetchDexscreenerTokenData(tokenAddress);
        if (!dex || !dex.pairs || dex.pairs.length === 0) {
          notFound();
        }
        setDexscreenerData(dex.pairs[0]);
        const research = await fetchTokenResearch(dex.pairs[0].baseToken.symbol);
        setResearchData(research);
        const dexCache = await getTimeUntilNextDexscreenerRefresh(`token:${tokenAddress}`);
        if (dexCache.lastRefreshTime) {
          setDexLastRefresh(dexCache.lastRefreshTime);
          setDexNextRefresh(new Date(dexCache.lastRefreshTime.getTime() + 5 * 60 * 1000));
        }
      } catch (err) {
        console.error("Error loading token research page:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [tokenAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dashYellow-light">Loading...</p>
      </div>
    );
  }

  if (!dexscreenerData) {
    notFound();
  }

  const tokenSymbol = dexscreenerData.baseToken.symbol || "Unknown";
  const tokenName = dexscreenerData.baseToken.name || tokenSymbol;
  const price = Number.parseFloat(dexscreenerData.priceUsd || "0");
  const volume24h = dexscreenerData.volume?.h24 || 0;
  const liquidity = dexscreenerData.liquidity?.usd || 0;
  const pairAddress = dexscreenerData.pairAddress || tokenAddress;
  const change24h = dexscreenerData.priceChange?.h24 || 0;
  const formattedDexLastRefresh = dexLastRefresh
    ? dexLastRefresh.toLocaleString()
    : "N/A";
  const formattedDexNextRefresh = dexNextRefresh
    ? dexNextRefresh.toLocaleString()
    : "N/A";

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <DashcoinLogo size={48} />
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-8">
        <Link href="/" className="flex items-center gap-2 text-dashYellow-light hover:text-dashYellow">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-start gap-6 items-start md:items-center">
          <div className="flex justify-between text-center">
            <div className="flex flex-col">
              <h1 className="dashcoin-title text-3xl text-dashYellow">{tokenSymbol}</h1>
            </div>
          </div>
          <DashcoinCard className="md:max-w-md mt-4 md:mt-0">
            <DashcoinCardHeader>
              <DashcoinCardTitle className="text-2xl">Creator Wallet Activity</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p>{researchData?.["Wallet Comments"] || "No wallet activity available"}</p>
              {researchData?.["Wallet Link"] ? (
                <a
                  href={researchData["Wallet Link"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dashYellow-light flex items-center text-sm mt-2"
                >
                  Link to creator wallet <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              ) : null}
            </DashcoinCardContent>
          </DashcoinCard>
          {researchData?.Twitter && (
            <a
              href={`${researchData.Twitter.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <Twitter className="h-4 w-4 mr-2" />
              View on Twitter
            </a>
          )}
          <div className="flex gap-2">
            <a
              href={dexscreenerData.url || `https://axiom.trade/t/${tokenAddress}/dashc`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dashYellow hover:text-dashYellow-dark font-medium dashcoin-text flex items-center px-4 py-2 text-lg"
            >
              Trade
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>

        {researchData && <FoundersEdgeChecklist data={researchData} showLegend />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Trading Activity (24h)</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Volume</p>
                  <p className="text-xl font-bold">{formatCurrency(volume24h)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Liquidity</p>
                  <p className="text-xl font-bold">{formatCurrency(liquidity)}</p>
                </div>
              </div>
            </DashcoinCardContent>
          </DashcoinCard>

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
                {dexscreenerData.dexId && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-80">DEX</span>
                    <span className="text-sm">{dexscreenerData.dexId}</span>
                  </div>
                )}
                {dexscreenerData.pairAddress && (
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

        {pairAddress && (
          <DexscreenerChart tokenAddress={pairAddress} title="Price Chart" />
        )}
      </main>
      <footer className="container mx-auto py-8 px-4 mt-12 border-t border-dashGreen-light">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <DashcoinLogo size={32} />
          <p className="text-sm opacity-80">© 2025 Dashcoin. All rights reserved.</p>
          <div className="flex gap-4">
            <DashcoinButton variant="outline" size="sm">Docs</DashcoinButton>
            <DashcoinButton variant="outline" size="sm">GitHub</DashcoinButton>
          </div>
        </div>
      </footer>
    </div>
  );
}
