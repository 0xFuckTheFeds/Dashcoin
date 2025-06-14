import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { fetchAllTokensFromDune } from "../actions/dune-actions";
import { fetchCreatorWalletLinks } from "../actions/googlesheet-action";
import { fetchDexscreenerTokenLogo } from "../actions/dexscreener-actions";
import { CreatorWalletList } from "@/components/creator-wallet-list";
import {
  Wallet,
  Activity,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Database
} from "lucide-react";

export default async function CreatorWalletsPage() {
  const tokens = await fetchAllTokensFromDune();
  const walletData = await fetchCreatorWalletLinks();

  const walletMap = new Map(
    walletData.map((d) => [d.symbol.toUpperCase(), { link: d.walletLink, activity: d.walletActivity }])
  );

  const tokensWithWallets = await Promise.all(
    tokens.map(async (token) => {
      const entry =
        walletMap.get(token.symbol.toUpperCase()) || { link: "", activity: "" };
      const logo = await fetchDexscreenerTokenLogo(token.token);

      return {
        name: token.name || token.symbol,
        symbol: token.symbol,
        tokenUrl: logo || token.token_url,
        walletLink: entry.link,
        walletActivity: entry.activity,
      };
    }),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.08),transparent_50%)]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-l from-green-500/6 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-teal-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Mesh pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-7xl mt-16">
        {/* Enhanced Header Section */}
        <section className="mb-12">
          <div className="text-center mb-10">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-xl">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <Wallet className="w-4 h-4" />
              <span>Creator Transparency Hub</span>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-500"></div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-teal-100 to-emerald-200 bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              Creator Wallets
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Track what your favorite{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text font-semibold">
                creators are doing
              </span>
              {" "}with their earned fees. Full transparency into creator wallet activity.
            </p>

          </div>
        </section>

        {/* Enhanced Controls Section */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Wallet Directory</h2>
                <p className="text-slate-400">Complete overview of creator wallet activities</p>
              </div>
            </div>
            
            {/* Enhanced Controls */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-400 focus:bg-white/[0.08] focus:border-white/20 transition-all duration-200 backdrop-blur-xl w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-xl">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Token List */}
        <section>
          {tokensWithWallets.length > 0 ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden">
              {/* Table Header */}
              <div className="bg-white/[0.03] border-b border-white/[0.08] px-8 py-6">
                <div className="grid grid-cols-12 gap-6 items-center text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  <div className="col-span-4">Token</div>
                  <div className="col-span-4">Creator Wallet</div>
                  <div className="col-span-4">Recent Activity</div>
                </div>
              </div>

              {/* Table Body */}
              <CreatorWalletList tokens={tokensWithWallets} />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No wallet data available</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">We're working on gathering creator wallet information. Check back soon for updates.</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105">
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          )}
        </section>

        {/* Enhanced Info Section */}
        <section className="mt-16">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Transparency First</h3>
              </div>
              <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
                We believe in complete transparency in the creator economy. Track how creators are utilizing 
                their earned fees, whether they're reinvesting, holding, or distributing rewards.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}