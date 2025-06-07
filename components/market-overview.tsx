import { Suspense } from "react";
import { MarketCapChart } from "@/components/market-cap-chart";
import { MarketCapPie } from "@/components/market-cap-pie";
import {
  TrendingUp,
  PieChart,
  Clock,
  Target,
  AlertCircle,
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

export async function MarketOverview({
  marketCapTimeDataPromise,
  tokenMarketCapsPromise,
}: {
  marketCapTimeDataPromise: Promise<any>;
  tokenMarketCapsPromise: Promise<any>;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Market Overview</h2>
            <p className="text-slate-400">Real-time analytics and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-sm font-medium">Live Data</span>
        </div>
      </div>
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
  );
}

