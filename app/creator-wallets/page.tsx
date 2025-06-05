import { Navbar } from "@/components/navbar";
import { fetchAllTokensFromDune } from "../actions/dune-actions";
import { fetchCreatorWalletLinks } from "../actions/googlesheet-action";
import { 
  ExternalLink, 
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

  const tokensWithWallets = tokens.map((token) => {
    const entry = walletMap.get(token.symbol.toUpperCase()) || { link: "", activity: "" };
    return {
      name: token.name || token.symbol,
      symbol: token.symbol,
      walletLink: entry.link,
      walletActivity: entry.activity,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.08),transparent_50%)]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-l from-purple-500/6 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-xl">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <Wallet className="w-4 h-4" />
              <span>Creator Transparency Hub</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              Creator Wallets
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Track what your favorite{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text font-semibold">
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
              <div className="p-3 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 rounded-2xl shadow-lg">
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
              <div className="divide-y divide-white/[0.05]">
                {tokensWithWallets.map((token, index) => (
                  <div key={`${token.symbol}-${index}`} className="group px-8 py-6 hover:bg-white/[0.02] transition-all duration-200">
                    <div className="grid grid-cols-12 gap-6 items-center">
                      {/* Token Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {token.symbol.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg tracking-tight">{token.name}</h3>
                            <p className="text-slate-400 text-sm">{token.symbol}</p>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Link */}
                      <div className="col-span-4">
                        {token.walletLink ? (
                          <a 
                            href={token.walletLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group/link inline-flex items-center gap-3 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-xl text-blue-400 hover:text-blue-300 transition-all duration-200 font-medium"
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

                      {/* Activity */}
                      <div className="col-span-4">
                        {token.walletActivity ? (
                          <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <Activity className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-300 leading-relaxed">{token.walletActivity}</p>
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
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No wallet data available</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">We're working on gathering creator wallet information. Check back soon for updates.</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105">
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
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
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