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
import AnimatedMarketCap from "@/components/animated-marketcap";
import EnvSetup from "./env-setup";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Twitter, TrendingUp, DollarSign, Activity, BarChart3, PieChart, Zap } from "lucide-react";

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
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl opacity-50"></div>
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
        <div className="relative z-10">
          <p className="text-slate-400">Error loading chart data</p>
        </div>
      </div>
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
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl opacity-50"></div>
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
        <div className="relative z-10">
          <p className="text-slate-400">Error loading chart data</p>
        </div>
      </div>
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
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl opacity-50"></div>
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
        <div className="relative z-10">
          <p className="text-center text-slate-400">Error loading token data</p>
        </div>
      </div>
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

  const totalMarketCapValue = marketStats?.totalMarketCap || 0;
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      {/* Enhanced Navbar */}
      <div className="relative z-50">
        <Navbar
          dashcStats={{
            tradeLink: dashcoinTradeLink,
            marketCap: dashcMarketCap,
            contractAddress: dashcoinCA,
          }}
        />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Hero Welcome Section */}
        <section className="animate-fade-in-up">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-3xl opacity-50 animate-pulse"></div>
            <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-3xl"></div>
            
            <div className="relative z-10 text-center py-16 px-8">
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
                  Dashcoin Research
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Your command center for real-time data, token comparisons, and alpha across the Believe coin ecosystem. 
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold"> We surface the signal—so you can trade smarter.</span>
              </p>
              
              {/* Stats bar */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-slate-400">Market Cap</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedMarketCap value={totalMarketCapValue} decimals={0} />
                  </div>
                </div>
                <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-400">24h Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{formattedVolume}</div>
                </div>
                <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-400">Creator Fees</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{formattedFeeEarnings}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Token Table Section */}
        <section className="animate-fade-in-up delay-100">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Top Tokens by Market Cap
              </h2>
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
          
          <Suspense
            fallback={
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl opacity-50"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
                <div className="relative z-10 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                  <p className="text-slate-300">
                    Loading token data... This may take a moment as we fetch data for the top tokens.
                  </p>
                </div>
              </div>
            }
          >
            <TokenSearchListWrapper />
          </Suspense>
        </section>

        {/* Market Stats Cards */}
        <section className="animate-fade-in-up delay-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Total Market Cap Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
              
              <div className="relative z-10 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Total Market Cap</h3>
                    <p className="text-sm text-slate-400">Believe Coins excluding Launchcoin</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    <AnimatedMarketCap value={totalMarketCapValue} decimals={2} />
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                      <Zap className="w-4 h-4" />
                      <span>From Dune Analytics</span>
                    </div>
                    <DashcoinCacheStatus
                      lastUpdated={formattedLastRefresh}
                      nextUpdate={formattedNextRefresh}
                      hoursRemaining={hoursUntilRefresh}
                      minutesRemaining={minutesUntilRefresh}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Fees Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
              
              <div className="relative z-10 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Total Creator Fees</h3>
                    <p className="text-sm text-slate-400">24h Fee Generation</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {formattedFeeEarnings}
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-400">Estimated at 0.3% of volume</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="animate-fade-in-up delay-300">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Market Analytics
              </h2>
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Suspense
              fallback={
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-50"></div>
                  <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
                  <div className="relative z-10 flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <p className="text-slate-300">Loading chart...</p>
                  </div>
                </div>
              }
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
                <div className="relative z-10">
                  <MarketCapChartWrapper marketCapTimeDataPromise={marketCapTimeDataPromise} />
                </div>
              </div>
            </Suspense>
            
            <Suspense
              fallback={
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl opacity-50"></div>
                  <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
                  <div className="relative z-10 flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                    <p className="text-slate-300">Loading chart...</p>
                  </div>
                </div>
              }
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl"></div>
                <div className="relative z-10">
                  <MarketCapPieWrapper tokenMarketCapsPromise={tokenMarketCapsPromise} />
                </div>
              </div>
            </Suspense>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 mt-20">
        <div className="backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                  <DashcoinLogo size={40} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">© 2025 Dashcoin. All rights reserved.</p>
                  <p className="text-xs text-slate-500">Powered by Dune Analytics</p>
                </div>
              </div>
              
              <a
                href={dashcoinXLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Twitter className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-white font-medium">Follow on X</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}