import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { CheckCircle, XCircle, Circle } from "lucide-react";
import React from "react";
import { gradeMaps, valueToScore } from "@/lib/score";

export const canonicalChecklist = [
  "Team Doxxed",
  "Twitter Activity Level",
  "Time Commitment",
  "Prior Founder Experience",
  "Product Maturity",
  "Funding Status",
  "Token-Product Integration Depth",
  "Social Reach & Engagement Index",
  "Data Integration",
];

export const traitColorMap: Record<string, string> = {
  Yes: "green",
  No: "red",
  Unknown: "yellow",
};

function getIcon(status: "Yes" | "No" | "Unknown") {
  if (status === "Yes") {
    return <CheckCircle className="text-green-400 w-4 h-4" />;
  }
  if (status === "No") {
    return <XCircle className="text-red-400 w-4 h-4" />;
  }
  return <Circle className="text-yellow-400 w-4 h-4 fill-yellow-400" />;
}

function getStatus(value: any, label: string): "Yes" | "No" | "Unknown" {
  const score = valueToScore(value, (gradeMaps as any)[label]);
  if (score === 2) return "Yes";
  if (score === 1) return "No";
  return "Unknown";
}

interface ChecklistProps {
  data: Record<string, any>;
  showLegend?: boolean;
}

export function FoundersEdgeChecklist({ data, showLegend = false }: ChecklistProps) {
  if (!data) return null;
  const score = Number(data["Score"]) || 0;
  const statuses = canonicalChecklist.map(label => getStatus(data[label], label));
  const positiveCount = statuses.filter(s => s === "Yes").length;
  const highConfidence = positiveCount > canonicalChecklist.length / 2;
  const borderColor = score >= 70 ? "border-green-500" : score >= 40 ? "border-yellow-500" : "border-red-500";

  return (
    <DashcoinCard
      className={`relative bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow ${borderColor}`}
    >
      {highConfidence && (
        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
          High Confidence
        </div>
      )}
      <div className="flex justify-center items-center gap-6 mb-4">
        <h2 className="text-2xl font-semibold">Founder&apos;s Edge Checklist</h2>
        <div className="bg-dashYellow text-black px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center">
          <span>
            Score: <span className="font-bold">{score}</span> / 100
          </span>
          {score >= 75 && <span className="ml-2 animate-bounce">🐸</span>}
        </div>
      </div>
      <p className="text-base opacity-80 mb-6 text-center">Signal-based checklist of founder credibility and product traction.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {canonicalChecklist.map((label) => {
          const raw = data[label];
          const status = getStatus(raw, label);
          return (
            <div
              key={label}
              className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-1 text-sm text-white"
            >
              {getIcon(status)}
              <span className="text-base">{label}</span>
            </div>
          );
        })}
      </div>
      {showLegend && (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1"><Circle className="text-yellow-400 w-4 h-4 fill-yellow-400" /> Unknown</div>
          <div className="flex items-center gap-1"><XCircle className="text-red-500 w-4 h-4" /> No</div>
          <div className="flex items-center gap-1"><CheckCircle className="text-green-500 w-4 h-4" /> Yes</div>
        </div>
      )}
    </DashcoinCard>
  );
}
