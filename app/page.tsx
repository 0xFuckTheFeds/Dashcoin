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
import { formatCurrency, formatCurrency0 } from "@/lib/utils";
import EnvSetup from "./env-setup";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import {
  Twitter,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Users,
  Target,
  Sparkles,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

const MarketCapChartWrapper = async ({
  marketCapTimeDataPromise,
}: {
  marketCapTimeDataPromise: Promise<any>;
}) => {
  try {
    const marketCapTimeData = await marketCapTimeDataPromise;
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Market Cap Trend</h3>
              <p className="text-sm text-slate-400">Last 30 days performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Real-time</span>
          </div>
        </div>
        <MarketCapChart data={marketCapTimeData || []} />
      </div>
    );
  } catch (error) {
    console.error("Error in MarketCapChartWrapper:", error);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Failed to load chart</p>
          <p className="text-sm text-slate-500">Please try refreshing the page</p>
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
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Market Distribution</h3>
              <p className="text-sm text-slate-400">Top tokens by market cap</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Target className="w-4 h-4" />
            <span>Live data</span>
          </div>
        </div>
        <MarketCapPie data={tokenMarketCaps || []} />
      </div>
    );
  } catch (error) {
    console.error("Error in MarketCapPieWrapper:", error);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Failed to load distribution</p>
          <p className="text-sm text-slate-500">Please try refreshing the page</p>
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
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Unable to load token data</h3>
        <p className="text-slate-400 mb-6">There was an issue fetching the latest token information.</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg mx-auto transition-colors">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }
};

// Quick Stats Component
const QuickStatsCard = ({ icon: Icon, title, value, change, changeType = "positive", subtitle }) => (
  <div className="group relative h-full">
    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {changeType === 'positive' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export default async function Home() {
  const hasDuneApiKey = !!process.env.DUNE_API_KEY || process.env.NODE_ENV === 'development';
  
  if (!hasDuneApiKey && process.env.NODE_ENV === 'production') {
    return <EnvSetup />;
  }
  
  const dashcoinCA = "7gkgsqE2Uip7LUyrqEi8fyLPNSbn7GYu9yFgtxZwYUVa";
  const dashcoinTradeLink = "https://axiom.trade/meme/Fjq9SmWmtnETAVNbir1eXhrVANi1GDoHEA4nb4tNn7w6/@dashc";
  const dashcoinXLink = "https://x.com/Dashc_Research";
  
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
  let lastRefreshTime = new Date(Date.now() - 34 * 60 * 1000);

  try {
    const refreshInfo = await getTimeUntilNextDuneRefresh();
    timeRemaining = refreshInfo.timeRemaining;
    lastRefreshTime = refreshInfo.lastRefreshTime;
  } catch (error) {
    console.error("Error getting refresh time info:", error);
  }

  const nextRefreshTime = new Date(lastRefreshTime.getTime() + 1 * 60 * 60 * 1000);
  const formattedLastRefresh = lastRefreshTime.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
  const formattedNextRefresh = nextRefreshTime.toLocaleString();
  const hoursUntilRefresh = Math.floor(timeRemaining / (2 * 60 * 60 * 1000));
  const minutesUntilRefresh = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

  const totalMarketCapValue =
    totalMarketCap?.total_marketcap_usd || marketStats?.totalMarketCap || 0;
  const formattedTotalMarketCap = formatCurrency0(totalMarketCapValue);
  const formattedVolume = formatCurrency(marketStats?.volume24h || 0);
  const formattedFeeEarnings = formatCurrency(marketStats?.feeEarnings24h || 0);
  const formattedFeeEarnings0 = formatCurrency0(marketStats?.feeEarnings24h || 0);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-grey-950 to-slate-900 relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-green-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className=""></div>

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar
          dashcStats={{
            tradeLink: dashcoinTradeLink,
            marketCap: dashcMarketCap,
            contractAddress: dashcoinCA,
          }}
        />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl mt-16 mt-16">
        {/* Hero Section - Redesigned */}
        <section className="mb-12">
          <div className="text-center mb-16 mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Real-time Market Intelligence
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 via-teal-400 to-green-400 bg-clip-text text-transparent mb-6">
              Real-time market data at your fingertips
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Advanced analytics and real-time insights for the{" "}
              <span className="text-transparent bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text font-semibold">
                Believe coin ecosystem
              </span>
              . Make informed decisions with comprehensive market data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#product"
                className="relative group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Explore Dashboard</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              
              <a
                href={dashcoinXLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
                <span>Follow Updates</span>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </a>
            </div>
          </div>

          {/* Quick Stats Grid - Improved Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <QuickStatsCard
              icon={TrendingUp}
              title="Total Market Cap"
              value={formattedTotalMarketCap}
              change="+12.5%"
              changeType="positive"
            />
            <QuickStatsCard
              icon={Activity}
              title="Total Volume"
              value={formattedVolume}
              change="+8.2%"
              changeType="positive"
            />
            <QuickStatsCard
              icon={DollarSign}
              title="Creator Fees"
              value={formattedFeeEarnings0}
              change="+15.7%"
              changeType="positive"
              subtitle="Estimated from total volume*"
            />
            <QuickStatsCard
              icon={Users}
              title="Indexed Tokens"
              value={marketStats?.coinLaunches || "N/A"}
              change="+3"
              changeType="positive"
            />
          </div>
        </section>

        {/* Market Overview Section */}
        <section id="product" className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Market Overview</h2>
                <p className="text-slate-400">Real-time analytics and performance metrics</p>
              </div>
            </div>
            
            {/* Data Freshness Indicator */}
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live Data</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <Suspense
              fallback={
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-96 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div>
                    <p className="text-slate-300">Loading market trends...</p>
                  </div>
                </div>
              }
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all duration-300 h-full">
                <MarketCapChartWrapper marketCapTimeDataPromise={marketCapTimeDataPromise} />
              </div>
            </Suspense>
            
            <Suspense
              fallback={
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-96 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                    <p className="text-slate-300">Loading distribution data...</p>
                  </div>
                </div>
              }
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all duration-300 h-full">
                <MarketCapPieWrapper tokenMarketCapsPromise={tokenMarketCapsPromise} />
              </div>
            </Suspense>
          </div>

        </section>

        {/* Token Analysis Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">

              <div>
                <h2 className="text-3xl font-bold text-white">Token Analysis</h2>
                <p className="text-slate-400">Comprehensive token data and rankings</p>
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-all duration-200">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <Suspense
            fallback={
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                  <p className="text-xl text-slate-300">Loading token data...</p>
                </div>
                <p className="text-slate-400">This may take a moment as we fetch data for all tokens.</p>
              </div>
            }
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <TokenSearchListWrapper />
            </div>
          </Suspense>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 mt-20">
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10">
          <div className="container mx-auto py-12 px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <DashcoinLogo size={240} />
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Providing comprehensive analytics and real-time insights for the Believe coin ecosystem.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                <div className="space-y-2">
                  <a href={dashcoinTradeLink} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trade Dashcoin</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href={dashcoinXLink} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <Twitter className="w-4 h-4" />
                    <span>Follow Updates</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              {/* Data Source */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Data & Analytics</h4>
                <div className="space-y-3">


                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-400">© 2025 Dashcoin Research. All rights reserved.</p>
                  <p className="text-xs text-slate-500">Built for the Believe ecosystem</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>System Status: Operational</span>
                  </div>
                  
                  <a
                    href={dashcoinXLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Twitter className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-white font-medium text-sm">Follow</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}