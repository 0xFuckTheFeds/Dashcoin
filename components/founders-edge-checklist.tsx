import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import React from "react";
import { gradeMaps, valueToScore, computeFounderScore } from "@/lib/score";
import { traitDescriptions } from "@/data/trait-descriptions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

function getIcon(value: number) {
  switch (value) {
    case 2:
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    case 1:
      return <XCircle className="text-red-500 w-5 h-5" />;
    default:
      return <MinusCircle className="text-yellow-400 w-5 h-5" />;
  }
}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canonicalChecklist.map((label) => {
          const raw = data[label];
          const val = valueToScore(raw, (gradeMaps as any)[label]);
          return (
            <TooltipProvider delayDuration={0} key={label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 bg-white text-black rounded-full px-4 py-3 cursor-help">
                    {getIcon(val)}
                    <span className="text-base">{label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{traitDescriptions[label]}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
