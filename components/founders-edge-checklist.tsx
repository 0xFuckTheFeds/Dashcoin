import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import React from "react";

export const canonicalChecklist = [
  "Founder Doxxed",
  "Dev is Active on Twitter",
  "Successful Exit",
  "Discussed Plans for Token Integration",
  "Project has 200k+ views on Social Media",
  "Live Product Exists",
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
  const score = Number(data["Score"]) || 0;
  const borderColor =
    score >= 70 ? "border-green-500" : score >= 40 ? "border-yellow-500" : "border-red-500";

  return (
    <DashcoinCard className={`relative bg-zinc-900 p-8 rounded-2xl shadow-lg ${borderColor}`}>\
      <div className="absolute top-4 right-4 bg-dashYellow text-black px-3 py-1 rounded-full text-sm font-semibold shadow">
        Score: <span className="font-bold">{score}</span> / 100
      </div>
      <h2 className="text-xl font-semibold text-dashYellow mb-1">Founder&apos;s Edge Checklist</h2>
      <p className="text-sm opacity-80 mb-4">Signal-based checklist of founder credibility and product traction.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {canonicalChecklist.map((label) => {
          const raw = data[label];
          const val = typeof raw === "string" ? parseInt(raw) : Number(raw);
          return (
            <div key={label} className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-2">
              {getIcon(val)}
              <span className="text-sm">{label}</span>
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
