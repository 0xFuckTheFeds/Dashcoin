import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { gradeMaps, valueToScore } from "@/lib/score";

interface ResearchData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

interface Props {
  token1: ResearchData | null;
  token2: ResearchData | null;
}

function traitColor(value: any, label: string) {
  const score = valueToScore(value, (gradeMaps as any)[label] || gradeMaps.default);
  if (score === 2) return "bg-green-600 text-white";
  if (score === 1) return "bg-yellow-600 text-black";
  return "bg-gray-600 text-white";
}

function scoreColor(score: number | null) {
  if (score === null || isNaN(score)) return "bg-gray-600 text-white";
  if (score >= 70) return "bg-green-600 text-white";
  if (score >= 40) return "bg-yellow-600 text-black";
  return "bg-gray-600 text-white";
}

export function FounderMetadataGrid({ token1, token2 }: Props) {
  if (!token1 || !token2) return null;

  const rows = [
    { label: "Research Score", val1: token1.score, val2: token2.score, score: true },
    ...canonicalChecklist.map(trait => ({ label: trait.label, val1: token1[trait.label], val2: token2[trait.label], score: false })),
  ];

  return (
    <div className="divide-y divide-dashGreen-light">
      <div className="hidden md:grid grid-cols-3 font-semibold mb-2">
        <div className="p-2 text-gray-300">Trait</div>
        <div className="p-2 text-center text-gray-300">{token1.symbol}</div>
        <div className="p-2 text-center text-gray-300">{token2.symbol}</div>
      </div>
      {rows.map(({ label, val1, val2, score }) => {
        const s1 = score ? (typeof val1 === 'number' ? val1 : 0) : valueToScore(val1, (gradeMaps as any)[label] || gradeMaps.default);
        const s2 = score ? (typeof val2 === 'number' ? val2 : 0) : valueToScore(val2, (gradeMaps as any)[label] || gradeMaps.default);
        const best1 = s1 > s2;
        const best2 = s2 > s1;
        const classBest1 = best1 ? "border border-dashYellow" : "";
        const classBest2 = best2 ? "border border-dashYellow" : "";
        const col1 = score ? scoreColor(val1 as number | null) : traitColor(val1, label);
        const col2 = score ? scoreColor(val2 as number | null) : traitColor(val2, label);
        return (
          <div key={label} className="flex flex-col md:grid md:grid-cols-3 py-2 gap-2 group">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-2 font-medium cursor-help text-gray-50">{label}</div>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className={`px-2 text-center rounded-md ${col1} ${classBest1} group-hover:bg-dashGreen-light/20`}>{val1 || '-'}</div>
            <div className={`px-2 text-center rounded-md ${col2} ${classBest2} group-hover:bg-dashGreen-light/20`}>{val2 || '-'}</div>
          </div>
        );
      })}
    </div>
  );
}
