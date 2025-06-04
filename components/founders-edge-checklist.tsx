import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import React from "react";
import { gradeMaps, valueToScore, computeFounderScore } from "@/lib/score";

function barColor(score: number) {
  if (score === 2) return "bg-green-500";
  if (score === 1) return "bg-yellow-500";
  return "bg-red-500";
}

function overallColor(score: number) {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}
export const canonicalChecklist = [
  "Team Doxxed",
  "Twitter Activity Level",
  "Time Commitment",
  "Prior Founder Experience",
  "Product Maturity",
  "Funding Status",
  "Token-Product Integration Depth",
  "Social Reach & Engagement Index",
];

interface ChecklistProps {
  data: Record<string, any>;
  showLegend?: boolean;
}

export function FoundersEdgeChecklist({ data, showLegend = false }: ChecklistProps) {
  if (!data) return null;
  const sheetScore = Number(data["Score"]);
  const score = !isNaN(sheetScore) && sheetScore > 0 ? sheetScore : computeFounderScore(data);
  return (
    <DashcoinCard
      className="token-card relative p-10 rounded-2xl shadow-lg"
    >
      <div className="flex justify-center items-center gap-6 mb-4">
        <h2 className="text-2xl font-semibold text-dashYellow">Founder&apos;s Edge Checklist</h2>
        <div className="bg-dashGreen text-white px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center">
          <span>
            Founder Score: <span className="font-bold">{score}</span> / 100
          </span>
          {score >= 75 && <span className="ml-2 animate-bounce">🐸</span>}
        </div>
      </div>
      <p className="text-base opacity-80 mb-6 text-center">Signal-based checklist of founder credibility and product traction.</p>
      <div className="space-y-3">
        {[{ label: "Founder Score", value: score, overall: true },
          ...canonicalChecklist.map(label => ({
            label,
            value: valueToScore(data[label], (gradeMaps as any)[label]),
            overall: false,
          }))].map(({ label, value, overall }) => {
            const barValue = overall ? Math.max(0, Math.min(100, Number(value))) : value * 50;
            const color = overall ? overallColor(barValue) : barColor(value);
            return (
              <div key={label} className="flex items-center gap-4">
                <span className="w-48 text-sm font-medium text-dashYellow">{label}</span>
                <div className="flex-1 bg-gray-200 rounded h-3 overflow-hidden">
                  <div
                    className={`h-3 ${color} rounded transition-all duration-700`}
                    style={{ width: `${barValue}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
      {showLegend && (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1"><MinusCircle className="text-yellow-400 w-4 h-4" /> Unknown</div>
          <div className="flex items-center gap-1"><XCircle className="text-red-500 w-4 h-4" /> No</div>
          <div className="flex items-center gap-1"><CheckCircle className="text-green-500 w-4 h-4" /> Yes</div>
        </div>
      )}
    </DashcoinCard>
  );
}
