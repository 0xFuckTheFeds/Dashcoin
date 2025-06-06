"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { DashcoinCard, DashcoinCardContent, DashcoinCardHeader, DashcoinCardTitle } from "@/components/ui/dashcoin-card";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  BarChart2, 
  Users, 
  ArrowRight, 
  InfoIcon, 
  Loader2, 
  ArrowLeftRight,
  TrendingUp,
  Download,
  Printer,
  BarChart3,
  Activity,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkles,
  Target,
  Zap,
  Clock
} from "lucide-react";
import { TokenHeaderCard } from "@/components/token-header-card";
import { DashcoinLogo } from "@/components/dashcoin-logo";
import { SimpleGrowthCard } from "@/components/simple-growth-card";
import { FounderMetadataGrid } from "@/components/founder-metadata-grid";
import { fetchTokenResearch } from "@/app/actions/googlesheet-action";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TokenData {
  token: string;
  name: string;
  symbol: string;
  marketCap: number;
  num_holders: number;
  volume24h: number;
  first_trade_time: string;
  marketcapgrowthperday: number;
}

interface ComparisonTokenData {
  address: string;
  name: string;
  symbol: string;
  marketCap: number;
  holders: number;
  volume24h: number;
  launchDate: string;
  marketcapgrowthperday: number;
}

interface ResearchScoreData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toLocaleString();
};

const calculateMultiple = (value1: number, value2: number): string => {
  if (value2 === 0) {
    return value1 === 0 ? "0.0x" : "N/A";
  }
  if (value1 === 0) { 
    return "0.0x";
  }
  const actualMultiple = value1 / value2;

  if (actualMultiple < 0.1) {
    return "<0.1x";
  }

  const roundedMultiple = Math.ceil(actualMultiple * 10) / 10;
  return `${roundedMultiple.toFixed(1)}x`;
};

const getDifferenceColorClass = (value1: number, value2: number, multipleString: string): string => {
  if (multipleString === "N/A" || multipleString === "0.0x") {
    return 'text-slate-400';
  }
  if (value1 > value2) {
    return 'text-emerald-400';
  }
  if (value1 < value2) {
    return 'text-red-400';
  }
  return 'text-slate-400'; 
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg">
        <p className="label text-teal-400 font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm text-white">
            {`${entry.name} : ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Enhanced Stats Card Component
const ComparisonStatsCard = ({ icon: Icon, title, value1, value2, label1, label2, gradient, winner }) => (
  <div className="group relative">
    <div className={`absolute inset-0 ${gradient || 'bg-gradient-to-r from-teal-500/20 to-green-500/20'} rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl`}></div>
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${gradient?.replace('/20', '') || 'bg-gradient-to-r from-teal-500 to-teal-600'} rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg border ${winner === 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
          <p className="text-sm text-slate-400 mb-1">{label1}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">{value1}</p>
            {winner === 1 && <ArrowUp className="w-4 h-4 text-emerald-400" />}
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${winner === 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
          <p className="text-sm text-slate-400 mb-1">{label2}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">{value2}</p>
            {winner === 2 && <ArrowUp className="w-4 h-4 text-emerald-400" />}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ComparePage() {
  const dashcoinXLink = "https://x.com/dune_dashcoin";

  const [token1Address, setToken1Address] = useState("");
  const [token2Address, setToken2Address] = useState("");
  const [token1Name, setToken1Name] = useState("");
  const [token2Name, setToken2Name] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allTokens, setAllTokens] = useState<TokenData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<{token1: ComparisonTokenData | null, token2: ComparisonTokenData | null}>({
    token1: null,
    token2: null
  });

  const [token1Suggestions, setToken1Suggestions] = useState<TokenData[]>([]);
  const [token2Suggestions, setToken2Suggestions] = useState<TokenData[]>([]);
  const [showToken1Suggestions, setShowToken1Suggestions] = useState(false);
  const [showToken2Suggestions, setShowToken2Suggestions] = useState(false);

  const [researchData, setResearchData] = useState<ResearchScoreData[]>([]);
  const [comparisonResearch, setComparisonResearch] = useState<{token1: ResearchScoreData | null, token2: ResearchScoreData | null}>({ token1: null, token2: null });

  const [useLogScale, setUseLogScale] = useState(false);

  const token1SuggestionsRef = useRef<HTMLDivElement>(null);
  const token2SuggestionsRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    async function fetchTokens() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const tokens = await response.json();
        setAllTokens(tokens);
        setError(null);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to load token data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTokens();
  }, []);

  useEffect(() => {
    async function loadResearch() {
      try {
        const data = await fetchTokenResearch();
        setResearchData(data);
      } catch (err) {
        console.error('Error fetching research data:', err);
      }
    }
    loadResearch();
  }, []);

  // Auto compare the top two tokens by market cap on initial load
  useEffect(() => {
    if (
      allTokens.length > 1 &&
      !isComparing &&
      token1Name === "" &&
      token2Name === "" &&
      researchData.length > 0
    ) {
      // Sort tokens client-side by market cap in descending order
      const sorted = [...allTokens].sort(
        (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
      );

      const topTwo = sorted.slice(0, 2);
      if (topTwo.length === 2) {
        const token1Data = convertTokenData(topTwo[0]);
        const token2Data = convertTokenData(topTwo[1]);
        const r1 = researchData.find(r => r.symbol.toUpperCase() === (topTwo[0].symbol || '').toUpperCase()) || null;
        const r2 = researchData.find(r => r.symbol.toUpperCase() === (topTwo[1].symbol || '').toUpperCase()) || null;

        setToken1Name(topTwo[0].token);
        setToken2Name(topTwo[1].token);
        setComparisonData({ token1: token1Data, token2: token2Data });
        setComparisonResearch({ token1: r1, token2: r2 });
        setIsComparing(true);
      }
    }
  }, [allTokens, researchData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (token1SuggestionsRef.current && !token1SuggestionsRef.current.contains(event.target as Node)) {
        setShowToken1Suggestions(false);
      }
      if (token2SuggestionsRef.current && !token2SuggestionsRef.current.contains(event.target as Node)) {
        setShowToken2Suggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [token1SuggestionsRef, token2SuggestionsRef]);

  const calculateMarketCapGrowthPerDay = (marketCap: number, launchDate: string): number => {
    const creationDate = new Date(launchDate);
    const today = new Date();
    const differenceInTime = today.getTime() - creationDate.getTime();
    const differenceInDays = Math.max(1, Math.floor(differenceInTime / (1000 * 3600 * 24)));
    return marketCap / differenceInDays;
  };

  const convertTokenData = (token: TokenData): ComparisonTokenData => {
    const marketcapgrowthperday = calculateMarketCapGrowthPerDay(token.marketCap, token.first_trade_time);
    return {
      address: token.token,
      name: token.name,
      symbol: token.symbol,
      marketCap: token.marketCap,
      holders: token.num_holders,
      volume24h: token.volume24h,
      launchDate: token.first_trade_time,
      marketcapgrowthperday
    };
  };

  // When research data loads or comparison tokens change, update the metadata
  useEffect(() => {
    if (!comparisonData.token1 || !comparisonData.token2 || researchData.length === 0) return;
    const r1 = researchData.find(r => r.symbol.toUpperCase() === (comparisonData.token1?.symbol || '').toUpperCase()) || null;
    const r2 = researchData.find(r => r.symbol.toUpperCase() === (comparisonData.token2?.symbol || '').toUpperCase()) || null;
    setComparisonResearch({ token1: r1, token2: r2 });
  }, [researchData, comparisonData]);

  const handleCompare = () => {
    setIsLoading(true);
    setError(null);
    try {
      let token1 = allTokens.find(t => t.token.toLowerCase() === token1Name.toLowerCase());
      let token2 = allTokens.find(t => t.token.toLowerCase() === token2Name.toLowerCase());
      
      if (!token1) {
        token1 = allTokens.find(t => 
          t.name.toLowerCase() === token1Name.toLowerCase() || 
          t.symbol.toLowerCase() === token1Name.toLowerCase()
        );
      }
      
      if (!token2) {
        token2 = allTokens.find(t => 
          t.name.toLowerCase() === token2Name.toLowerCase() || 
          t.symbol.toLowerCase() === token2Name.toLowerCase()
        );
      }
      
      if (!token1 || !token2) {
        setError('One or both tokens not found. Please check name, symbol, or address and try again.');
        setIsLoading(false);
        return;
      }
      const token1Data = convertTokenData(token1);
      const token2Data = convertTokenData(token2);

      console.log('TOKEN! ---------------------------->', token1Data)
      console.log("TOKEN2---------------->", token2Data);

      const r1 = researchData.find(r => r.symbol.toUpperCase() === (token1.symbol || '').toUpperCase()) || null;
      const r2 = researchData.find(r => r.symbol.toUpperCase() === (token2.symbol || '').toUpperCase()) || null;
      setComparisonData({ token1: token1Data, token2: token2Data });
      setComparisonResearch({ token1: r1, token2: r2 });
      setIsComparing(true);
    } catch (err) {
      console.error('Error during comparison:', err);
      setError('An error occurred during comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReverseCompare = () => {
    if (!comparisonData.token1 || !comparisonData.token2) return;

    setComparisonData(prevData => ({
      token1: prevData.token2,
      token2: prevData.token1
    }));

    setComparisonResearch(prev => ({ token1: prev.token2, token2: prev.token1 }));

    const currentToken1Name = token1Name;
    setToken1Name(token2Name);
    setToken2Name(currentToken1Name);
  };

  const exportCsv = () => {
    if (!comparisonData.token1 || !comparisonData.token2) return;
    const rows = [
      ['Metric', comparisonData.token1.symbol, comparisonData.token2.symbol],
      ['Market Cap', comparisonData.token1.marketCap, comparisonData.token2.marketCap],
      ['Holders', comparisonData.token1.holders, comparisonData.token2.holders],
      ['Volume', comparisonData.token1.volume24h, comparisonData.token2.volume24h],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = () => {
    window.print();
  };

  const handleSwapInputs = () => {
    setToken1Name(token2Name);
    setToken2Name(token1Name);
  };

  const handleTokenSearch = (
    input: string, 
    nameSetter: React.Dispatch<React.SetStateAction<string>>,
    suggestionsSetter: React.Dispatch<React.SetStateAction<TokenData[]>>,
    showSuggestionsSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    nameSetter(input);
    if (input.length > 0) {
      const filtered = allTokens.filter(token => 
        token.name.toLowerCase().includes(input.toLowerCase()) || 
        token.symbol.toLowerCase().includes(input.toLowerCase()) ||
        token.token.toLowerCase().includes(input.toLowerCase())
      );
      suggestionsSetter(filtered);
      showSuggestionsSetter(true);
    } else {
      suggestionsSetter([]);
      showSuggestionsSetter(false);
    }
  };

  const handleSuggestionClick = (
    tokenAddress: string,
    nameSetter: React.Dispatch<React.SetStateAction<string>>,
    suggestionsSetter: React.Dispatch<React.SetStateAction<TokenData[]>>,
    showSuggestionsSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    nameSetter(tokenAddress);
    suggestionsSetter([]);
    showSuggestionsSetter(false);
  };

  const barChartData = comparisonData.token1 && comparisonData.token2 ? [
    {
      name: 'Market Cap',
      [comparisonData.token1.symbol]: comparisonData.token1.marketCap,
      [comparisonData.token2.symbol]: comparisonData.token2.marketCap,
    },
    {
      name: 'Holders',
      [comparisonData.token1.symbol]: comparisonData.token1.holders,
      [comparisonData.token2.symbol]: comparisonData.token2.holders,
    },
  ] : [];
  
  const GREEN_COLOR = "#10b981"; // emerald-500
  const RED_COLOR = "#ef4444";   // red-500
  const BLUE_COLOR = "#3b82f6";  // blue-500
  const PURPLE_COLOR = "#8b5cf6"; // purple-500

  let token1IsWinner = false;
  let token2IsWinner = false;
  if (comparisonData.token1 && comparisonData.token2) {
    if (comparisonData.token1.marketcapgrowthperday > comparisonData.token2.marketcapgrowthperday) {
      token1IsWinner = true;
    } else if (comparisonData.token2.marketcapgrowthperday > comparisonData.token1.marketcapgrowthperday) {
      token2IsWinner = true;
    }
  }

  let token1MarketCapColor = RED_COLOR;
  let token2MarketCapColor = GREEN_COLOR;
  if (comparisonData.token1 && comparisonData.token2) {
    if (comparisonData.token1.marketCap >= comparisonData.token2.marketCap) {
      token1MarketCapColor = GREEN_COLOR;
      token2MarketCapColor = RED_COLOR;
    } else {
      token1MarketCapColor = RED_COLOR;
      token2MarketCapColor = GREEN_COLOR;
    }
  }

  let token1HoldersColor = RED_COLOR;
  let token2HoldersColor = GREEN_COLOR;
  if (comparisonData.token1 && comparisonData.token2) {
    if (comparisonData.token1.holders >= comparisonData.token2.holders) {
      token1HoldersColor = GREEN_COLOR;
      token2HoldersColor = RED_COLOR;
    } else {
      token1HoldersColor = RED_COLOR;
      token2HoldersColor = GREEN_COLOR;
    }
  }

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

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl mt-16">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Advanced Token Comparison
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-teal-200 to-green-200 bg-clip-text text-transparent mb-6">
            Token Comparison
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Compare any two tokens with{" "}
            <span className="text-transparent bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text font-semibold">
              comprehensive market analytics
            </span>
            . Analyze market cap, holders, volume, and growth metrics side by side.
          </p>
        </section>

        {/* Search Section */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Select Tokens to Compare</h2>
                <p className="text-slate-400">Enter token names, symbols, or addresses</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCompare(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative" ref={token1SuggestionsRef}>
                  <label htmlFor="token1" className="block mb-3 text-sm font-medium text-slate-300">
                    First Token
                  </label>
                  <input 
                    type="text" 
                    id="token1" 
                    value={token1Name}
                    onChange={(e) => handleTokenSearch(e.target.value, setToken1Name, setToken1Suggestions, setShowToken1Suggestions)}
                    onFocus={() => token1Suggestions.length > 0 && setShowToken1Suggestions(true)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 transition-all duration-200"
                    placeholder="e.g. DUPE" 
                    autoComplete="off" 
                  />
                  {showToken1Suggestions && token1Suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {token1Suggestions.map(token => (
                        <div 
                          key={token.token} 
                          onClick={() => handleSuggestionClick(token.token, setToken1Name, setToken1Suggestions, setShowToken1Suggestions)}
                          className="px-4 py-3 text-white hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                        >
                          <div className="font-medium">{token.name} ({token.symbol})</div>
                          <div className="text-xs text-slate-400 truncate">{token.token}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleSwapInputs} 
                    className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all duration-200"
                    aria-label="Swap tokens"
                  >
                    <ArrowLeftRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="relative" ref={token2SuggestionsRef}>
                  <label htmlFor="token2" className="block mb-3 text-sm font-medium text-slate-300">
                    Second Token
                  </label>
                  <input 
                    type="text" 
                    id="token2" 
                    value={token2Name}
                    onChange={(e) => handleTokenSearch(e.target.value, setToken2Name, setToken2Suggestions, setShowToken2Suggestions)}
                    onFocus={() => token2Suggestions.length > 0 && setShowToken2Suggestions(true)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all duration-200"
                    placeholder="e.g. KLED" 
                    autoComplete="off" 
                  />
                  {showToken2Suggestions && token2Suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {token2Suggestions.map(token => (
                        <div 
                          key={token.token} 
                          onClick={() => handleSuggestionClick(token.token, setToken2Name, setToken2Suggestions, setShowToken2Suggestions)}
                          className="px-4 py-3 text-white hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                        >
                          <div className="font-medium">{token.name} ({token.symbol})</div>
                          <div className="text-xs text-slate-400 truncate">{token.token}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button 
                  type="submit" 
                  onClick={handleCompare} 
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      <span>Compare Tokens</span>
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    <InfoIcon className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <InfoIcon className="h-4 w-4" />
                  <span>Enter token names, symbols, or contract addresses</span>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Comparison Results */}
        {isComparing && comparisonData.token1 && comparisonData.token2 && (
          <>
            {/* Token Headers */}
            <section className="mb-12">
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="flex-1 max-w-md">
                  <TokenHeaderCard
                    name={comparisonData.token1.name}
                    symbol={comparisonData.token1.symbol}
                    address={comparisonData.token1.address}
                  />
                </div>
                
                <button
                  onClick={handleReverseCompare}
                  className="group p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all duration-300"
                  aria-label="Reverse token comparison"
                >
                  <ArrowLeftRight className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                </button>
                
                <div className="flex-1 max-w-md">
                  <TokenHeaderCard
                    name={comparisonData.token2.name}
                    symbol={comparisonData.token2.symbol}
                    address={comparisonData.token2.address}
                  />
                </div>
              </div>
            </section>

            {/* Quick Stats Overview */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Performance Comparison</h2>
                  <p className="text-slate-400">Side-by-side metric analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ComparisonStatsCard
                  icon={DollarSign}
                  title="Market Cap"
                  value1={`${formatNumber(comparisonData.token1.marketCap)}`}
                  value2={`${formatNumber(comparisonData.token2.marketCap)}`}
                  label1={comparisonData.token1.symbol}
                  label2={comparisonData.token2.symbol}
                  winner={comparisonData.token1.marketCap > comparisonData.token2.marketCap ? 1 : 2}
                  gradient="bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
                />
                
                <ComparisonStatsCard
                  icon={Users}
                  title="Holders"
                  value1={formatNumber(comparisonData.token1.holders)}
                  value2={formatNumber(comparisonData.token2.holders)}
                  label1={comparisonData.token1.symbol}
                  label2={comparisonData.token2.symbol}
                  winner={comparisonData.token1.holders > comparisonData.token2.holders ? 1 : 2}
                  gradient="bg-gradient-to-r from-teal-500/20 to-green-500/20"
                />
                
                <ComparisonStatsCard
                  icon={TrendingUp}
                  title="Daily Growth"
                  value1={`${formatNumber(comparisonData.token1.marketcapgrowthperday)}`}
                  value2={`${formatNumber(comparisonData.token2.marketcapgrowthperday)}`}
                  label1={comparisonData.token1.symbol}
                  label2={comparisonData.token2.symbol}
                  winner={comparisonData.token1.marketcapgrowthperday > comparisonData.token2.marketcapgrowthperday ? 1 : 2}
                  gradient="bg-gradient-to-r from-green-500/20 to-teal-500/20"
                />
              </div>
            </section>

            {/* Charts Section */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Visual Analytics</h2>
                  <p className="text-slate-400">Interactive charts and comparisons</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Market Cap Chart */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                        <BarChart2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Market Cap Comparison</h3>
                        <p className="text-sm text-slate-400">Total market capitalization</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUseLogScale(v => !v)}
                      className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm rounded-lg transition-colors"
                    >
                      {useLogScale ? 'Linear' : 'Log'} Scale
                    </button>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={barChartData.slice(0,1)} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis 
                          tickFormatter={formatNumber} 
                          scale={useLogScale ? 'log' : 'linear'} 
                          domain={useLogScale ? [1, 'auto'] : undefined} 
                          tick={{ fontSize: 12, fill: '#94a3b8' }} 
                        />
                        <Tooltip 
                          content={<CustomTooltip />} 
                          cursor={false} 
                          formatter={(value: any, name: any, entry: any) => {
                              if (entry.dataKey === comparisonData.token1?.symbol || entry.dataKey === comparisonData.token2?.symbol) {
                                 const numValue = Number(value);
                                 if (!isNaN(numValue)) return [`${numValue.toLocaleString()}`, entry.name];
                              }
                              return [value, entry.name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey={comparisonData.token1.symbol} fill={token1MarketCapColor} radius={[4, 4, 0, 0]} />
                        <Bar dataKey={comparisonData.token2.symbol} fill={token2MarketCapColor} radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Holders Chart */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Holders Comparison</h3>
                      <p className="text-sm text-slate-400">Number of unique wallet holders</p>
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={barChartData.slice(1,2)} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis 
                          tickFormatter={formatNumber} 
                          scale={useLogScale ? 'log' : 'linear'} 
                          domain={useLogScale ? [1, 'auto'] : undefined} 
                          tick={{ fontSize: 12, fill: '#94a3b8' }} 
                        />
                        <Tooltip 
                          content={<CustomTooltip />} 
                          cursor={false} 
                          formatter={(value: any) => Number(value).toLocaleString()}
                        />
                        <Legend />
                        <Bar dataKey={comparisonData.token1.symbol} fill={token1HoldersColor} radius={[4, 4, 0, 0]} />
                        <Bar dataKey={comparisonData.token2.symbol} fill={token2HoldersColor} radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* Growth Rate Section */}
            <section className="mb-12">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Market Cap Growth per Day</h3>
                    <p className="text-slate-400">Daily average growth since launch</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SimpleGrowthCard
                    value={`+${formatNumber(comparisonData.token1.marketcapgrowthperday)} / day`}
                    label={comparisonData.token1.name}
                    highlight={token1IsWinner}
                  />
                  <SimpleGrowthCard
                    value={`+${formatNumber(comparisonData.token2.marketcapgrowthperday)} / day`}
                    label={comparisonData.token2.name}
                    highlight={token2IsWinner}
                  />
                </div>
              </div>
            </section>

            {/* Detailed Metrics Table */}
            <section className="mb-12">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Detailed Comparison</h3>
                      <p className="text-slate-400">Comprehensive metric breakdown</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={exportCsv}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button 
                      onClick={exportPng}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 font-semibold text-white">Metric</th>
                        <th className="text-right py-4 px-4 font-semibold text-white">{comparisonData.token1.symbol}</th>
                        <th className="text-right py-4 px-4 font-semibold text-white">{comparisonData.token2.symbol}</th>
                        <th className="text-right py-4 px-4 font-semibold text-white">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">Market Cap</td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token1.marketCap > comparisonData.token2.marketCap ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token1.marketCap.toLocaleString()}
                        </td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token2.marketCap > comparisonData.token1.marketCap ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token2.marketCap.toLocaleString()}
                        </td>
                        {(() => {
                          const v1 = comparisonData.token1.marketCap;
                          const v2 = comparisonData.token2.marketCap;
                          const multipleStr = calculateMultiple(v1, v2);
                          const colorClass = getDifferenceColorClass(v1, v2, multipleStr);
                          return (
                            <td className={`text-right py-4 px-4 font-medium ${colorClass}`}>
                              {multipleStr}
                            </td>
                          );
                        })()}
                      </tr>
                      
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">Holders</td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token1.holders > comparisonData.token2.holders ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          {comparisonData.token1.holders.toLocaleString()}
                        </td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token2.holders > comparisonData.token1.holders ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          {comparisonData.token2.holders.toLocaleString()}
                        </td>
                        {(() => {
                          const v1 = comparisonData.token1.holders;
                          const v2 = comparisonData.token2.holders;
                          const multipleStr = calculateMultiple(v1, v2);
                          const colorClass = getDifferenceColorClass(v1, v2, multipleStr);
                          return (
                            <td className={`text-right py-4 px-4 font-medium ${colorClass}`}>
                              {multipleStr}
                            </td>
                          );
                        })()}
                      </tr>
                      
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">Total Volume</td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token1.volume24h > comparisonData.token2.volume24h ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token1.volume24h.toLocaleString()}
                        </td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token2.volume24h > comparisonData.token1.volume24h ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token2.volume24h.toLocaleString()}
                        </td>
                        {(() => {
                          const v1 = comparisonData.token1.volume24h;
                          const v2 = comparisonData.token2.volume24h;
                          const multipleStr = calculateMultiple(v1, v2);
                          const colorClass = getDifferenceColorClass(v1, v2, multipleStr);
                          return (
                            <td className={`text-right py-4 px-4 font-medium ${colorClass}`}>
                              {multipleStr}
                            </td>
                          );
                        })()}
                      </tr>
                      
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">Launch Date</td>
                        <td className="text-right py-4 px-4 text-white">
                          {new Date(comparisonData.token1.launchDate).toLocaleDateString()}
                        </td>
                        <td className="text-right py-4 px-4 text-white">
                          {new Date(comparisonData.token2.launchDate).toLocaleDateString()}
                        </td>
                        <td className="text-right py-4 px-4 text-slate-400">
                          {Math.abs(Math.floor((new Date(comparisonData.token1.launchDate).getTime() - new Date(comparisonData.token2.launchDate).getTime()) / (1000 * 60 * 60 * 24)))} days
                        </td>
                      </tr>
                      
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">MarketCap Growth/Day</td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token1.marketcapgrowthperday > comparisonData.token2.marketcapgrowthperday ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token1.marketcapgrowthperday.toLocaleString()}
                        </td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token2.marketcapgrowthperday > comparisonData.token1.marketcapgrowthperday ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${comparisonData.token2.marketcapgrowthperday.toLocaleString()}
                        </td>
                        {(() => {
                          const v1 = comparisonData.token1.marketcapgrowthperday;
                          const v2 = comparisonData.token2.marketcapgrowthperday;
                          const multipleStr = calculateMultiple(v1, v2);
                          const colorClass = getDifferenceColorClass(v1, v2, multipleStr);
                          return (
                            <td className={`text-right py-4 px-4 font-medium ${colorClass}`}>
                              {multipleStr}
                            </td>
                          );
                        })()}
                      </tr>
                      
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-slate-300">Market Cap per Holder</td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token1.marketCap/comparisonData.token1.holders > comparisonData.token2.marketCap/comparisonData.token2.holders ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${(comparisonData.token1.marketCap/comparisonData.token1.holders).toLocaleString()}
                        </td>
                        <td className={`text-right py-4 px-4 ${comparisonData.token2.marketCap/comparisonData.token2.holders > comparisonData.token1.marketCap/comparisonData.token1.holders ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'} rounded-lg`}>
                          ${(comparisonData.token2.marketCap/comparisonData.token2.holders).toLocaleString()}
                        </td>
                        {(() => {
                          const v1 = comparisonData.token1.marketCap/comparisonData.token1.holders;
                          const v2 = comparisonData.token2.marketCap/comparisonData.token2.holders;
                          const multipleStr = calculateMultiple(v1, v2);
                          const colorClass = getDifferenceColorClass(v1, v2, multipleStr);
                          return (
                            <td className={`text-right py-4 px-4 font-medium ${colorClass}`}>
                              {multipleStr}
                            </td>
                          );
                        })()}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Founder & Project Metadata */}
            <section className="mb-12">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Founder & Project Metadata</h3>
                    <p className="text-slate-400">Research scores and project insights</p>
                  </div>
                </div>
                
                <FounderMetadataGrid token1={comparisonResearch.token1} token2={comparisonResearch.token2} />
              </div>
            </section>
          </>
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
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <DashcoinLogo size={40} />
                  </div>

                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Advanced analytics and comparative insights for the Believe coin ecosystem.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setIsComparing(false)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Target className="w-4 h-4" />
                    <span>New Comparison</span>
                  </button>
                  {comparisonData.token1 && comparisonData.token2 && (
                      <button
                        onClick={handleReverseCompare}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        <span>Reverse Comparison</span>
                      </button>
                  )}
                </div>
              </div>

              {/* Social & Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Connect</h4>
                <div className="space-y-3">
                  <a 
                    href={dashcoinXLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
                      <Twitter className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Follow Updates</p>
                      <p className="text-slate-400 text-xs">@dune_dashcoin</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Real-time data updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-400">© 2025 Dashcoin Research. All rights reserved.</p>
                  <p className="text-xs text-slate-500">Comprehensive token comparison tools</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>Live Data Active</span>
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