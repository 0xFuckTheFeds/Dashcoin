import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
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
    display: "Is the team publicly doxxed and verifiable?",
    category: "Team",
    description:
      "This team has disclosed legal names. This boosts trust in volatile markets.",
  },
  {
    label: "Twitter Activity Level",
    display: "How active and consistent is the team on Twitter?",
    category: "Community",
    description: "How frequently the team engages on Twitter and shares updates.",
  },
  {
    label: "Time Commitment",
    display: "Is the team working on this full-time or part-time?",
    category: "Team",
    description:
      "Indicates if the founders are working full time or part time on the project.",
  },
  {
    label: "Prior Founder Experience",
    display: "Do the founders have prior experience building or scaling projects?",
    category: "Team",
    description: "Number of past startups founded by the team members.",
  },
  {
    label: "Product Maturity",
    display: "How far along is the product in terms of development and user adoption?",
    category: "Product",
    description:
      "Stage of the product: prototype, MVP, or revenue generating.",
  },
  {
    label: "Funding Status",
    display: "Has the project raised any funding?",
    category: "Funding",
    description: "Whether the project is venture backed, angel funded or bootstrapped.",
  },
  {
    label: "Token-Product Integration Depth",
    display: "How deeply is the token integrated into the core functionality of the product?",
    category: "Product",
    description: "How integrated the token is within the live product.",
  },
  {
    label: "Social Reach & Engagement Index",
    display: "How large is the project's social following?",
    category: "Community",
    description: "Overall social following and engagement of the project.",
  },
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
        {canonicalChecklist.map(({ label, display }) => {
          const raw = data[label];
          const val = valueToScore(raw, (gradeMaps as any)[label]);
          return (
            <div
              key={label}
              className="flex items-center gap-2 bg-white text-black rounded-full px-4 py-3"
            >
              {getIcon(val)}
              <span className="text-base">{display}</span>
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
