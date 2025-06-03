import { Navbar } from "@/components/navbar";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
} from "@/components/ui/dashcoin-card";
import { DexscreenerChart } from "@/components/dexscreener-chart";
import { fetchDexscreenerTokenData } from "./actions/dexscreener-actions";
import { formatCurrency } from "@/lib/utils";
import { Twitter } from "lucide-react";

export default async function Home() {
  const dashcoinCA = "7gkgsqE2Uip7LUyrqEi8fyLPNSbn7GYu9yFgtxZwYUVa";
  const dashcoinTradeLink =
    "https://axiom.trade/meme/Fjq9SmWmtnETAVNbir1eXhrVANi1GDoHEA4nb4tNn7w6/@dashc";
  const dashcoinXLink = "https://x.com/dune_dashcoin";

  const dexscreenerData = await fetchDexscreenerTokenData(dashcoinCA).catch(
    () => null,
  );

  let price = 0;
  let marketCap = 0;
  let volume24h = 0;
  let change24h = 0;
  let liquidity = 0;
  let pairAddress = "";

  if (dexscreenerData && dexscreenerData.pairs && dexscreenerData.pairs.length) {
    const pair = dexscreenerData.pairs[0];
    price = Number(pair.priceUsd || 0);
    marketCap = pair.fdv || 0;
    volume24h = pair.volume?.h24 || 0;
    change24h = pair.priceChange?.h24 || 0;
    liquidity = pair.liquidity?.usd || 0;
    pairAddress = pair.pairAddress;
  }

  return (
    <div className="min-h-screen">
      <Navbar dashcStats={{ tradeLink: dashcoinTradeLink, marketCap }} />
      <main className="container mx-auto px-4 py-6 space-y-8">
        <h1 className="dashcoin-title text-4xl text-dashYellow mb-4">
          Dashcoin Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Price</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">
                ${price.toFixed(price < 0.01 ? 8 : 6)}
              </p>
              <p
                className={`text-sm mt-2 ${change24h >= 0 ? "text-dashGreen-accent" : "text-dashRed"}`}
              >
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%
              </p>
            </DashcoinCardContent>
          </DashcoinCard>
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Market Cap</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">
                ${formatCurrency(marketCap)}
              </p>
            </DashcoinCardContent>
          </DashcoinCard>
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Volume (24h)</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">
                ${formatCurrency(volume24h)}
              </p>
            </DashcoinCardContent>
          </DashcoinCard>
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Liquidity</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-2xl text-dashYellow">
                ${formatCurrency(liquidity)}
              </p>
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
          <a
            href={dashcoinXLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-dashYellow hover:text-dashYellow-dark transition-colors px-4 py-2 border border-dashYellow rounded-md"
          >
            <Twitter className="h-5 w-5" />
            <span className="dashcoin-text">Follow on X</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
