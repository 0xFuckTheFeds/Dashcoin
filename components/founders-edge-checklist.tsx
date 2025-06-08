import { DashcoinCard } from "@/components/ui/dashcoin-card";
import React from "react";
import { gradeMaps, valueToScore, computeFounderScore } from "@/lib/score";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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
}

export function FoundersEdgeChecklist({ data }: ChecklistProps) {
  if (!data) return null;
  const sheetScore = Number(data["Score"] ?? (data as any).score);
  const score = !isNaN(sheetScore) && sheetScore > 0 ? sheetScore : computeFounderScore(data);

  const groups = canonicalChecklist.reduce<Record<string, TraitInfo[]>>((acc, trait) => {
    acc[trait.category] = acc[trait.category] || [];
    acc[trait.category].push(trait);
    return acc;
  }, {});

  const badgeClasses = (raw: any, val: number) => {
    const unknown = raw === undefined || raw === null || raw === "" || /^unknown$/i.test(String(raw));
    if (unknown) return "bg-slate-600 text-white";
    switch (val) {
      case 2:
        return "bg-emerald-600 text-white";
      case 1:
        return "bg-yellow-500 text-black";
      default:
        return "bg-red-600 text-white";
    }
  };

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

      <Accordion type="multiple" defaultValue={Object.keys(groups)} className="space-y-6">
        {Object.entries(groups).map(([category, traits]) => (
          <AccordionItem key={category} value={category} className="border-b border-white/10 pt-6 first:pt-0">
            <AccordionTrigger className="text-left py-3">
              <span className="text-lg font-semibold text-white">{category}</span>
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <ul className="divide-y divide-white/10">
                {traits.map(({ label, display }) => {
                  const raw = data[label];
                  const val = valueToScore(raw, (gradeMaps as any)[label]);
                  const displayVal = val * 6;
                  return (
                    <li key={label} className="flex items-center justify-between py-3 px-2 odd:bg-white/5">
                      <span className="text-slate-300 pr-2">{display}</span>
                      <span className="flex items-center gap-2">
                        <Badge className={`px-2 py-0.5 text-xs font-semibold ${badgeClasses(raw, val)}`}>+{displayVal}</Badge>
                        <span className="text-slate-400 text-xs whitespace-nowrap">{raw || 'Unknown'}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </DashcoinCard>
  );
}
