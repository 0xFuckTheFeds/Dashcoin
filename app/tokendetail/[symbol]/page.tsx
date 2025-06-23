"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  ArrowLeft, 
  Twitter, 
  ExternalLink,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Users,
  Wallet,
  Calendar,
  Globe,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Copy
} from "lucide-react";
import { DashcoinButton } from "@/components/ui/dashcoin-button";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
} from "@/components/ui/dashcoin-card";
import { DexscreenerChart } from "@/components/dexscreener-chart";
import {
  fetchTokenDetails,
  getTimeUntilNextDuneRefresh,
} from "@/app/actions/dune-actions";
import {
  fetchDexscreenerTokenData,
  getTimeUntilNextDexscreenerRefresh,
} from "@/app/actions/dexscreener-actions";
import { fetchDexscreenerTokenLogo } from "@/app/actions/dexscreener-actions";
import { formatCurrency, formatCurrency0 } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyAddress } from "@/components/copy-address";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { ResearchDataTable } from "@/components/research-data-table";
import { gradeMaps, valueToScore } from "@/lib/score";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface TokenResearchData {
  Symbol: string;
  Score: number | string;
  "Team Doxxed": number | string;
  "Twitter Activity Level": number | string;
  "Time Commitment": number | string;
  "Prior Founder Experience": number | string;
  "Product Maturity": number | string;
  "Funding Status": number | string;
  "Token-Product Integration Depth": number | string;
  "Social Reach & Engagement Index": number | string;
  "Relevant Links": string;
  Comments: string;
  "Wallet Link": string;
  "Wallet Comments": string;
  "Bull Case"?: string;
  Twitter?: string;
  [key: string]: any;
}

async function fetchTokenResearchClient(
  tokenSymbol: string,
): Promise<TokenResearchData | null> {
  try {
    const res = await fetch(`/api/research/${tokenSymbol}`);
    if (!res.ok) return null;
    const raw = await res.json();
    const labels = [
      'Score',
      'Symbol',
      'Team Doxxed',
      'Twitter Activity Level',
      'Time Commitment',
      'Prior Founder Experience',
      'Product Maturity',
      'Funding Status',
      'Token-Product Integration Depth',
      'Social Reach & Engagement Index',
      'Relevant Links',
      'Comments',
      'Wallet Link',
      'Wallet Comments',
      'Bull Case',
      'Twitter',
    ];
    const canonicalMap: Record<string, string> = {};
    labels.forEach((l) => (canonicalMap[l.toLowerCase()] = l));

    const normalized: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      const key = canonicalMap[k.toLowerCase()] || k;
      normalized[key] = v;
    }

    return normalized as TokenResearchData;
  } catch (err) {
    console.error('Error fetching research data:', err);
    return null;
  }
}

// Enhanced Stats Card Component
const StatsCard = ({
  icon: Icon,
  title,
  value,
  change,
  changeType = "positive",
  subtitle,
  gradient,
}) => (
  <div className="relative">
    <div
      className={`absolute inset-0 ${
        gradient || 'bg-gradient-to-r from-teal-500/20 to-green-500/20'
      } rounded-xl opacity-30 blur-xl`}
    ></div>
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 ${gradient?.replace('/20', '') || 'bg-gradient-to-r from-teal-500 to-teal-600'} rounded-lg`}>
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

// Research Score Badge Component
const ResearchScoreBadge = ({ score, data }: { score: number; data?: Record<string, any> }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-teal-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Caution';
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl cursor-help">
            <div className={`p-2 bg-gradient-to-r ${getScoreColor(score)} rounded-lg`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Research Score</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{score}/100</span>
                <span className={`text-sm font-medium bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                  {getScoreLabel(score)}
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        {data && (
          <TooltipContent className="text-left">
            <ul className="space-y-1">
              {canonicalChecklist.map(({ label, display }) => {
                const raw = data[label];
                const val = valueToScore(raw, (gradeMaps as any)[label]);
                const displayVal = val * 6;
                return (
                  <li key={label} className="flex justify-between gap-2">
                    <span>{display}</span>
                    <span className="font-semibold">+{displayVal}</span>
                  </li>
                );
              })}
            </ul>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default function TokenResearchPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { symbol } = params;
  const [tokenData, setTokenData] = useState<any>(null);
  const [dexscreenerData, setDexscreenerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duneLastRefresh, setDuneLastRefresh] = useState<Date | null>(null);
  const [duneNextRefresh, setDuneNextRefresh] = useState<Date | null>(null);
  const [duneTimeRemaining, setDuneTimeRemaining] = useState<number>(0);
  const [dexLastRefresh, setDexLastRefresh] = useState<Date | null>(null);
  const [dexNextRefresh, setDexNextRefresh] = useState<Date | null>(null);
  const [dexTimeRemaining, setDexTimeRemaining] = useState<number>(0);
  const router = useRouter();
  const [researchData, setResearchData] = useState<TokenResearchData | null>(null);
  const [hasScore, setHasScore] = useState(false);
  const [tokenLogo, setTokenLogo] = useState<string | null>(null);
  const [bullExpanded, setBullExpanded] = useState(false);

  const formattedDuneLastRefresh = duneLastRefresh
    ? duneLastRefresh.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : "N/A";
  const formattedDuneNextRefresh = duneNextRefresh
    ? duneNextRefresh.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : "N/A";
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

  useEffect(() => {
    const getResearchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTokenResearchClient(symbol);
        setResearchData(data);
        setHasScore(!!data && data["Score"] != null && data["Score"] !== "");
      } catch (error) {
        console.error(`Error fetching research data for ${symbol}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    getResearchData();
  }, [symbol]);

  const hasLoaded = useRef(false)

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    async function loadData() {
      try {
        const duneTokenData = await fetchTokenDetails(symbol);
        if (!duneTokenData) {
          notFound();
        }

        setTokenData(duneTokenData);

        const duneCache = await getTimeUntilNextDuneRefresh();
        const dexCache = duneTokenData?.token
          ? await getTimeUntilNextDexscreenerRefresh(
              `token:${duneTokenData.token}`,
            )
          : { timeRemaining: 0, lastRefreshTime: null };

        setDuneLastRefresh(duneCache.lastRefreshTime);
        setDuneNextRefresh(
          new Date(duneCache.lastRefreshTime.getTime() + 1 * 60 * 60 * 1000),
        );
        setDuneTimeRemaining(duneCache.timeRemaining);

        if (dexCache.lastRefreshTime) {
          setDexLastRefresh(dexCache.lastRefreshTime);
          setDexNextRefresh(
            new Date(dexCache.lastRefreshTime.getTime() + 5 * 60 * 1000),
          );
          setDexTimeRemaining(dexCache.timeRemaining);
        }

        if (duneTokenData && duneTokenData.token) {
          const dexData = await fetchDexscreenerTokenData(duneTokenData.token);
          if (dexData && dexData.pairs && dexData.pairs.length > 0) {
            setDexscreenerData(dexData.pairs[0]);
          }
        }
      } catch (error) {
        console.error("Error loading token data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [symbol]);

  const chartAddress =
    dexscreenerData?.pairAddress || (tokenData && tokenData.token) || "";
  const price = dexscreenerData?.priceUsd
    ? Number.parseFloat(dexscreenerData.priceUsd)
    : (tokenData && tokenData.price) || 0;
  const marketCap =
    dexscreenerData?.fdv || (tokenData && tokenData.marketCap) || 0;
  const change24h =
    dexscreenerData?.priceChange?.h24 ||
    (tokenData && tokenData.change24h) ||
    0;
  const volume24h =
    dexscreenerData?.volume?.h24 || (tokenData && tokenData.volume24h) || 0;
  const liquidity =
    dexscreenerData?.liquidity?.usd || (tokenData && tokenData.liquidity) || 0;
  const txs = dexscreenerData
    ? (dexscreenerData.txns?.h24?.buys || 0) +
      (dexscreenerData.txns?.h24?.sells || 0)
    : (tokenData && tokenData.txs) || 0;
  const buys = dexscreenerData?.txns?.h24?.buys || 0;
  const sells = dexscreenerData?.txns?.h24?.sells || 0;
  const change1h =
    dexscreenerData?.priceChange?.h1 || (tokenData && tokenData.change1h) || 0;
  const tokenSymbol = tokenData?.symbol || "Unknown";
  const tokenAddress = tokenData?.token || "";
  const createdTime = tokenData?.created_time
    ? new Date(tokenData.created_time).toLocaleDateString()
    : "Unknown";

  useEffect(() => {
    async function loadLogo() {
      if (!tokenAddress) return;
      try {
        const img = await fetchDexscreenerTokenLogo(tokenAddress);
        if (img) {
          setTokenLogo(img);
        }
      } catch (err) {
        console.error("Error fetching token logo:", err);
      }
    }

    loadLogo();
  }, [tokenAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-grey-950 to-slate-900 relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-green-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-8 max-w-screen-2xl mt-16">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex justify-center mb-8">
          <h1 className="flex items-center gap-2 text-4xl font-bold bg-gradient-to-r from-white via-teal-200 to-green-200 bg-clip-text text-transparent">
            {tokenLogo && (
              <Image src={tokenLogo} alt={`${tokenSymbol} logo`} width={40} height={40} className="w-10 h-10 rounded-full" />
            )}
            {tokenSymbol}
          </h1>
        </div>

        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Token Header */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                {researchData && researchData.Score && (
                  <ResearchScoreBadge score={Number(researchData.Score)} data={researchData} />
                )}
              </div>
              
              
              <div className="flex items-center gap-4 text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {createdTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={
                    tokenAddress
                      ? `https://axiom.trade/t/${tokenAddress}/dashc`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Trade Now</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                
                {researchData?.Twitter && (
                  <a
                    href={`${researchData.Twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Follow</span>
                    <ExternalLink className="w-4 h-4 opacity-60" />
                  </a>
                )}
                
              </div>
            </div>

            {/* Creator Wallet Card */}
            {researchData?.["Wallet Comments"] && (
              <div className="lg:max-w-md w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl opacity-30 blur-xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Creator Wallet</h3>
                        <p className="text-sm text-slate-400">Activity Analysis</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {researchData["Wallet Comments"]}
                    </p>
                    
                    {researchData?.["Wallet Link"] && (
                      <a
                        href={researchData["Wallet Link"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm transition-colors"
                      >
                        <span>View Wallet</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Research & Market */}
        {researchData && hasScore && (
          <section className="mb-12 grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Founder's Edge Analysis</h2>
                  <p className="text-slate-400">Comprehensive research metrics and risk assessment</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <ResearchDataTable data={researchData} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Market Performance</h2>
                  <p className="text-slate-400">Real-time trading metrics and price data</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <StatsCard
                  icon={DollarSign}
                  title="Current Marketcap"
                  value={formatCurrency0(marketCap)}
                  change={`${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`}
                  changeType={change24h >= 0 ? 'positive' : 'negative'}
                  subtitle="24h change"
                  gradient="bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
                />

                <StatsCard
                  icon={Activity}
                  title="24h Volume"
                  value={formatCurrency0(volume24h)}
                  change={`${change1h >= 0 ? '+' : ''}${change1h.toFixed(2)}%`}
                  changeType={change1h >= 0 ? 'positive' : 'negative'}
                  subtitle="1h change"
                  gradient="bg-gradient-to-r from-teal-500/20 to-green-500/20"
                />

                <StatsCard
                  icon={Users}
                  title="Liquidity"
                  value={formatCurrency0(liquidity)}
                  subtitle="Available liquidity"
                  gradient="bg-gradient-to-r from-green-500/20 to-teal-500/20"
                />

                <StatsCard
                  icon={Zap}
                  title="24h Transactions"
                  value={txs.toLocaleString()}
                  subtitle={`${buys} buys, ${sells} sells`}
                  gradient="bg-gradient-to-r from-orange-500/20 to-red-500/20"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl opacity-30 blur-xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Trading Activity</h3>
                        <p className="text-slate-400">24-hour transaction breakdown</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Buy Orders</p>
                        <div className="flex items-center gap-3">
                          <p className="text-3xl font-bold text-emerald-400">{buys.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-emerald-400 text-sm">
                            <ArrowUp className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Sell Orders</p>
                        <div className="flex items-center gap-3">
                          <p className="text-3xl font-bold text-red-400">{sells.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-red-400 text-sm">
                            <ArrowDown className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Buy/Sell Ratio</span>
                        <span className="text-white font-medium">
                          {sells > 0 ? (buys / sells).toFixed(2) : '∞'}:1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-2xl opacity-30 blur-xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Token Details</h3>
                        <p className="text-slate-400">Contract and trading information</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Contract Address</span>
                        {tokenAddress ? (
                          <CopyAddress
                            address={tokenAddress}
                            showBackground={true}
                            className="text-teal-400 hover:text-teal-300"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">Not available</span>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">Symbol</span>
                        <span className="text-sm text-white font-medium">{tokenSymbol}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">Created</span>
                        <span className="text-sm text-white font-medium">{createdTime}</span>
                      </div>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Bull Case */}
        {researchData?.["Bull Case"] && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <ArrowUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Bull Case</h2>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className={!bullExpanded ? "max-h-40 overflow-hidden relative" : undefined}>
                <p
                  className="text-slate-300 whitespace-pre-line [&_a]:text-white [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: researchData["Bull Case"] as string,
                  }}
                />
                {!bullExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent pointer-events-none" />
                )}
              </div>
              <button
                onClick={() => setBullExpanded(!bullExpanded)}
                className="mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium"
              >
                {bullExpanded ? "Show Less" : "Read More"}
              </button>
            </div>
          </section>
        )}


        {/* Price Chart */}
        {chartAddress && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Price Chart</h2>
                <p className="text-slate-400">Interactive trading view with technical analysis</p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <DexscreenerChart tokenAddress={chartAddress} title="Price Chart" />
            </div>
          </section>
        )}


        {/* Loading States */}
        {isLoading && (
          <section className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Research Data</h3>
                  <p className="text-slate-400">Analyzing {symbol} token metrics...</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* No Research Data State */}
        {!isLoading && !hasScore && (
          <section className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Research Data Unavailable</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Comprehensive research analysis is not yet available for <strong>{symbol}</strong>. 
                Our team is constantly expanding coverage of new tokens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Browse Other Tokens</span>
                </Link>
                <a
                  href="https://x.com/Nic_Wenzel_1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <Activity className="w-5 h-5" />
                  <span>Request Analysis</span>
                </a>
              </div>
            </div>
          </section>
        )}
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
                    <div className="absolute inset-0 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <DashcoinLogo size={240} />
                  </div>

                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Providing comprehensive analytics and real-time insights for the Believe coin ecosystem.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <BarChart3 className="w-4 h-4" />
                    <span>Market Dashboard</span>
                  </Link>
                  <a href={
                    tokenAddress
                      ? `https://axiom.trade/t/${tokenAddress}/dashc`
                      : "#"
                  } target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trade {tokenSymbol}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  {researchData?.Twitter && (
                    <a href={`${researchData.Twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                      <Twitter className="w-4 h-4" />
                      <span>Follow Project</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>

              {/* Data Sources */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Data Sources</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Real-time Analytics</p>
                      <p className="text-slate-400 text-xs">Powered by Dune & DEX APIs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Last updated: {formattedDuneLastRefresh}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-400">© 2025 Dashcoin Research. All rights reserved.</p>
                  <p className="text-xs text-slate-500">Advanced token analysis for the Believe ecosystem</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>Live Data Active</span>
                  </div>
                  
                  <Link
                    href="/"
                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <BarChart3 className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-white font-medium text-sm">Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}