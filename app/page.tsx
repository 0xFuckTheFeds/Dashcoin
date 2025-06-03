import Image from "next/image";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
  DashcoinCacheStatus,
} from "@/components/ui/dashcoin-card";
import { MarketCapChart } from "@/components/market-cap-chart";
import { MarketCapPie } from "@/components/market-cap-pie";
import {
  fetchMarketCapOverTime,
  fetchMarketStats,
  fetchTokenMarketCaps,
  fetchTotalMarketCap,
  getTimeUntilNextDuneRefresh,
} from "./actions/dune-actions";
import { fetchDexscreenerTokenData } from "./actions/dexscreener-actions";
import { formatCurrency } from "@/lib/utils";
import EnvSetup from "./env-setup";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Twitter } from "lucide-react";

const MarketCapChartWrapper = async ({
  marketCapTimeDataPromise,
}: {
  marketCapTimeDataPromise: Promise<any>;
}) => {
  try {
    const marketCapTimeData = await marketCapTimeDataPromise;
    return <MarketCapChart data={marketCapTimeData || []} />;
  } catch (error) {
    console.error("Error in MarketCapChartWrapper:", error);
    return (
      <DashcoinCard className="h-48 flex items-center justify-center">
        <p>Error loading chart data</p>
      </DashcoinCard>
    );
  }
};

const MarketCapPieWrapper = async ({
  tokenMarketCapsPromise,
}: {
  tokenMarketCapsPromise: Promise<any>;
}) => {
  try {
    const tokenMarketCaps = await tokenMarketCapsPromise;
    return <MarketCapPie data={tokenMarketCaps || []} />;
  } catch (error) {
    console.error("Error in MarketCapPieWrapper:", error);
    return (
      <DashcoinCard className="h-48 flex items-center justify-center">
        <p>Error loading chart data</p>
      </DashcoinCard>
    );
  }
};


const TokenSearchListWrapper = async () => {
  try {
    const TokenSearchList = (await import("@/components/token-search-list")).default;
    return <TokenSearchList />;
  } catch (error) {
    console.error("Error loading TokenSearchList:", error);
    return (
      <DashcoinCard className="p-8 flex items-center justify-center">
        <p className="text-center">Error loading token data</p>
      </DashcoinCard>
    );
  }
};

export default async function Home() {
  const hasDuneApiKey = !!process.env.DUNE_API_KEY;
  if (!hasDuneApiKey) {
    return <EnvSetup />;
  }
  const dashcoinCA = "7gkgsqE2Uip7LUyrqEi8fyLPNSbn7GYu9yFgtxZwYUVa";
  const dashcoinTradeLink =
    "https://axiom.trade/meme/Fjq9SmWmtnETAVNbir1eXhrVANi1GDoHEA4nb4tNn7w6/@dashc";
  const dashcoinXLink = "https://x.com/dune_dashcoin";
  const marketStatsPromise = fetchMarketStats().then(data => {
    return data;
  }).catch((error) => {
    console.error("Error fetching market stats:", error);
    return {
      totalMarketCap: 0,
      volume24h: 0,
      transactions24h: 0,
      feeEarnings24h: 0,
      lifetimeVolume: 0,
      coinLaunches: 0,
    };
  });

  const marketCapTimeDataPromise = fetchMarketCapOverTime().catch((error) => {
    console.error("Error fetching market cap over time:", error);
    return [];
  });
    
  const tokenMarketCapsPromise = fetchTokenMarketCaps().then(data => {
    return data;
  }).catch((error) => {
    console.error("error.fetching tokens makret cap", error);
    return {}
    });
  
  const totalMarketCapPromise = fetchTotalMarketCap().catch((error) => {
    console.error("Error fetching total market cap:", error);
    return { latest_data_at: new Date().toISOString(), total_marketcap_usd: 0 };
  });

  const dexscreenerDataPromise = fetchDexscreenerTokenData(dashcoinCA).catch(
    (error) => {
      console.error("Error fetching Dexscreener data:", error);
      return null;
    }
  );

  let marketStats, totalMarketCap, dexscreenerData;
  try {
    [marketStats, totalMarketCap, dexscreenerData] = await Promise.all([
      marketStatsPromise,
      totalMarketCapPromise,
      dexscreenerDataPromise,
    ]);
  } catch (error) {
    console.error("Error awaiting promises:", error);
    marketStats = {
      totalMarketCap: 0,
      volume24h: 0,
      transactions24h: 0,
      feeEarnings24h: 0,
      lifetimeVolume: 0,
      coinLaunches: 0,
    };
    totalMarketCap = {
      latest_data_at: new Date().toISOString(),
      total_marketcap_usd: 0,
    };
    dexscreenerData = null;
  }

  let timeRemaining = 0;
  let lastRefreshTime = new Date(Date.now() -  34 * 60 * 1000); // Default to 1 hours ago

  try {
    const refreshInfo = await getTimeUntilNextDuneRefresh();
    timeRemaining = refreshInfo.timeRemaining;
    lastRefreshTime = refreshInfo.lastRefreshTime;
  } catch (error) {
    console.error("Error getting refresh time info:", error);
  }

  const nextRefreshTime = new Date(
    lastRefreshTime.getTime() + 1 * 60 * 60 * 1000
  );

  const formattedLastRefresh = lastRefreshTime.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
  const formattedNextRefresh = nextRefreshTime.toLocaleString();

  const hoursUntilRefresh = Math.floor(timeRemaining / (2 * 60 * 60 * 1000));
  const minutesUntilRefresh = Math.floor(
    (timeRemaining % (60 * 60 * 1000)) / (60 * 1000)
  );

  const formattedMarketCap = formatCurrency(
    marketStats?.totalMarketCap || 0
  );
  const formattedVolume = formatCurrency(marketStats?.volume24h || 0);
  const formattedFeeEarnings = formatCurrency(marketStats?.feeEarnings24h || 0);

  let dashcPrice = 0;
  let dashcMarketCap = 0;
  let dashcVolume = 0;
  let dashcChange24h = 0;
  let dashcLiquidity = 0;

  if (dexscreenerData && dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
    const pair = dexscreenerData.pairs[0];

    dashcPrice = Number(pair.priceUsd || 0);
    dashcMarketCap = pair.fdv || 0;
    dashcVolume = pair.volume?.h24 || 0;
    dashcChange24h = pair.priceChange?.h24 || 0;
    dashcLiquidity = pair.liquidity?.usd || 0;
    // pair address and timestamp are available but unused in this view
  }

  return (
    <div className="min-h-screen">
      {/* Use the new Navbar component */}
      <Navbar
        dashcStats={{
          tradeLink: dashcoinTradeLink,
          marketCap: dashcMarketCap,
        }}
      />

      <main className="container mx-auto px-4 py-4 space-y-4">

        {/* Welcome Blurb */}
        <section className="animate-appear relative w-full h-64 flex items-center justify-center overflow-hidden bg-dashGreen">
          <div className="absolute inset-0 opacity-20 animate-pulse bg-[url('/api/placeholder/800/200')] bg-repeat" />
          <div className="relative z-10 text-center text-white px-6 py-4">
            <h1
              className="font-bold mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-[4.5rem]"
            >
              Welcome to Dashcoin Research
            </h1>
            <p
              className="opacity-90 text-sm sm:text-base md:text-lg lg:text-[2.25rem]"
            >
              Your command center for real-time data, token comparisons, and alpha across the Believe coin ecosystem. We surface the signal—so you can trade smarter.
            </p>
          </div>
        </section>


        {/* Token Table */}
        <div className="mt-2">
          <h2 className="dashcoin-text text-3xl text-dashYellow mb-4">
            Top Tokens by Market Cap
          </h2>
          <Suspense
            fallback={
              <DashcoinCard className="p-8 flex items-center justify-center">
                <p className="text-center">
                  Loading token data... This may take a moment as we fetch data for the
                  top tokens.
                </p>
              </DashcoinCard>
            }
          >
            <TokenSearchListWrapper />
          </Suspense>
        </div>


        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Total Market Cap of Believe Coins excluding Launchcoin</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-3xl text-dashYellow">{formattedMarketCap}</p>
              <div className="mt-2 pt-2 border-t border-dashGreen-light opacity-50">
                <p className="text-sm">From Dune Analytics</p>
              </div>
              <DashcoinCacheStatus
                lastUpdated={formattedLastRefresh}
                nextUpdate={formattedNextRefresh}
                hoursRemaining={hoursUntilRefresh}
                minutesRemaining={minutesUntilRefresh}
              />
            </DashcoinCardContent>
          </DashcoinCard>

          <DashcoinCard>
            <DashcoinCardHeader>
              <DashcoinCardTitle>Total Creator Fees</DashcoinCardTitle>
            </DashcoinCardHeader>
            <DashcoinCardContent>
              <p className="dashcoin-text text-3xl text-dashYellow">
                {formattedFeeEarnings}
              </p>
              <div className="mt-2 pt-2 border-t border-dashGreen-light opacity-50">
                <p className="text-sm">Estimated at 0.3% of volume</p>
              </div>
            </DashcoinCardContent>
          </DashcoinCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">
          <Suspense
            fallback={
              <DashcoinCard className="h-48 flex items-center justify-center">
                <p>Loading chart...</p>
              </DashcoinCard>
            }
          >
            <MarketCapChartWrapper marketCapTimeDataPromise={marketCapTimeDataPromise} />
          </Suspense>
          <Suspense
            fallback={
              <DashcoinCard className="h-48 flex items-center justify-center">
                <p>Loading chart...</p>
              </DashcoinCard>
            }
          >
            <MarketCapPieWrapper tokenMarketCapsPromise={tokenMarketCapsPromise} />
          </Suspense>
        </div>

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