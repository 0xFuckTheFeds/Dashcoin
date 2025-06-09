import { useEffect, useState, useMemo } from "react";
import type { TokenData } from "@/types/dune";
import type { CookieMetrics } from "@/app/actions/cookie-fun-actions";
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card";

interface CombinedToken extends TokenData, CookieMetrics {}

export default function CookieMindshareTable() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [cookieData, setCookieData] = useState<Record<string, CookieMetrics | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tokenRes = await fetch("/api/tokens");
        const tokenList: TokenData[] = await tokenRes.json();
        setTokens(tokenList);
        const symbols = tokenList.map(t => t.symbol).filter(Boolean);
        if (symbols.length) {
          const res = await fetch("/api/cookie-metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbols }),
          });
          const data = await res.json();
          setCookieData(data || {});
        }
      } catch (err) {
        console.error("Error loading Cookie data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const combined: CombinedToken[] = useMemo(() => {
    return tokens.map(t => {
      const sym = (t.symbol || "").toUpperCase();
      const metrics = cookieData[sym] || {};
      return { ...t, ...(metrics as any) } as CombinedToken;
    }).filter(t => typeof t.mindshare === 'number');
  }, [tokens, cookieData]);

  const topTokens = useMemo(() => {
    return [...combined].sort((a, b) => (b.mindshare ?? 0) - (a.mindshare ?? 0)).slice(0, 100);
  }, [combined]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading top mindshare tokens...
      </div>
    );
  }

  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Top Mindshare Tokens</DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashBlue-dark border-b border-dashBlack">
                <th className="text-left py-2 px-4 text-dashYellow">Symbol</th>
                <th className="text-left py-2 px-4 text-dashYellow">Mindshare</th>
              </tr>
            </thead>
            <tbody>
              {topTokens.map((t, idx) => (
                <tr key={idx} className="border-b border-dashBlue-light hover:bg-dashBlue-dark">
                  <td className="py-2 px-4 font-bold">{t.symbol}</td>
                  <td className="py-2 px-4">{typeof t.mindshare === 'number' ? t.mindshare.toFixed(1) : '-'}</td>
                </tr>
              ))}
              {topTokens.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center opacity-80">No mindshare data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  );
}
