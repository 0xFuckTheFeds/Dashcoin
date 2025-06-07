import { DashcoinCard } from "@/components/ui/dashcoin-card";
import React from "react";
import { gradeMaps, valueToScore, computeFounderScore } from "@/lib/score";

export interface TraitInfo {
  /**
   * Key used to pull the raw value from the research data object.
   */
  label: string
  /**
   * Display name shown in tooltips and tables.
   */
  display: string
  category: string
  description: string
}

export const canonicalChecklist: TraitInfo[] = [
  {
    label: "Team Doxxed",
    display: "Team Doxxed",
    category: "Team",
    description:
      "This team has disclosed legal names. This boosts trust in volatile markets.",
  },
  {
    label: "Twitter Activity Level",
    display: "Twitter Activity Level",
    category: "Community",
    description: "How frequently the team engages on Twitter and shares updates.",
  },
  {
    label: "Time Commitment",
    display: "Time Commitment",
    category: "Team",
    description:
      "Indicates if the founders are working full time or part time on the project.",
  },
  {
    label: "Prior Founder Experience",
    display: "Prior Founder Experience",
    category: "Team",
    description: "Number of past startups founded by the team members.",
  },
  {
    label: "Product Maturity",
    display: "Product Maturity",
    category: "Product",
    description:
      "Stage of the product: prototype, MVP, or revenue generating.",
  },
  {
    label: "Funding Status",
    display: "Funding Status",
    category: "Funding",
    description: "Whether the project is venture backed, angel funded or bootstrapped.",
  },
  {
    label: "Token-Product Integration Depth",
    display: "Token-Product Integration Depth",
    category: "Product",
    description: "How integrated the token is within the live product.",
  },
  {
    label: "Social Reach & Engagement Index",
    display: "Social Reach",
    category: "Community",
    description: "Overall social following and engagement of the project.",
  },
];


interface ChecklistProps {
  data: Record<string, any>;
  showLegend?: boolean;
}


export function FoundersEdgeChecklist({ data, showLegend = false }: ChecklistProps) {
  if (!data) return null;
  const sheetScore = Number(data["Score"] ?? (data as any).score);
  const score = !isNaN(sheetScore) && sheetScore > 0 ? sheetScore : computeFounderScore(data);

  const groups = canonicalChecklist.reduce<Record<string, TraitInfo[]>>((acc, trait) => {
    acc[trait.category] = acc[trait.category] || [];
    acc[trait.category].push(trait);
    return acc;
  }, {});

  return (
    <DashcoinCard className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-dashYellow">Founder's Edge</h3>
          <div className="text-sm text-white font-medium">
            Score: <span className="font-bold">{score}</span>/100
          </div>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-green-500" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groups).map(([category, traits]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-slate-400 uppercase mb-2">{category}</h4>
            <ul className="divide-y divide-white/10">
              {traits.map(({ label, display }) => {
                const raw = data[label];
                const val = valueToScore(raw, (gradeMaps as any)[label]);
                const displayVal = val * 6;
                return (
                  <li key={label} className="flex items-center justify-between py-2">
                    <span className="text-slate-300">{display}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">+{displayVal}</span>
                      <span className="text-slate-400 text-sm">{raw || 'Unknown'}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {showLegend && (
        <div className="pt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold">+12&nbsp;Positive</span>
          <span className="flex items-center gap-1 font-semibold">+6&nbsp;Negative</span>
          <span className="flex items-center gap-1 font-semibold">0&nbsp;Unknown</span>
        </div>
      )}
    </DashcoinCard>
  );
}
