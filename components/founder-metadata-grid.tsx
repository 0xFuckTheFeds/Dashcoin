"use client";

import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
} from "@/components/ui/dashcoin-card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { canonicalChecklist } from "@/components/founders-edge-checklist";
import { valueToScore } from "@/lib/score";
import {
  User,
  Twitter,
  Clock,
  Medal,
  Package,
  TrendingUp,
  Layers,
  Users,
  Lock,
  InfoIcon,
} from "lucide-react";
import React from "react";

const checklistIcons: Record<string, JSX.Element> = {
  "Team Doxxed": <User className="h-4 w-4" />,
  "Twitter Activity Level": <Twitter className="h-4 w-4" />,
  "Time Commitment": <Clock className="h-4 w-4" />,
  "Prior Founder Experience": <Medal className="h-4 w-4" />,
  "Product Maturity": <Package className="h-4 w-4" />,
  "Funding Status": <TrendingUp className="h-4 w-4" />,
  "Token-Product Integration Depth": <Layers className="h-4 w-4" />,
  "Social Reach & Engagement Index": <Users className="h-4 w-4" />,
};

function badgeColor(value: any): string {
  const score = valueToScore(value);
  if (score === 2) return "bg-green-600 text-white";
  if (score === 1) return "bg-yellow-600 text-black";
  return "bg-gray-600 text-white";
}

function textColor(value: any): string {
  const score = valueToScore(value);
  if (score === 2) return "text-green-400";
  if (score === 1) return "text-yellow-400";
  return "text-gray-400";
}

function scoreBadge(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) {
    return "bg-gray-600 text-white";
  }
  if (score >= 70) return "bg-green-600 text-white";
  if (score >= 40) return "bg-yellow-600 text-black";
  return "bg-red-600 text-white";
}

function compareValue(v1: any, v2: any): number {
  const s1 = valueToScore(v1);
  const s2 = valueToScore(v2);
  if (s1 > s2) return 1;
  if (s2 > s1) return -1;
  return 0;
}

export interface ResearchData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

interface FounderMetadataGridProps {
  token1: { name: string; symbol: string; data?: ResearchData };
  token2: { name: string; symbol: string; data?: ResearchData };
}

export function FounderMetadataGrid({ token1, token2 }: FounderMetadataGridProps) {
  const val = (data: ResearchData | undefined, label: string) =>
    data && data[label] ? data[label] : "N/A";
  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5" />Founder & Project Metadata
        </DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashGreen-light">
                <th className="text-left py-2 px-3">Trait</th>
                <th className="text-left py-2 px-3">
                  {token1.name} ({token1.symbol})
                </th>
                <th className="text-left py-2 px-3">
                  {token2.name} ({token2.symbol})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dashGreen-light">
                <td className="py-2 px-3 font-semibold">
                  <span className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Research Score
                  </span>
                </td>
                <td
                  className={`py-2 px-3 ${
                    (token1.data?.score || 0) > (token2.data?.score || 0)
                      ? "ring-1 ring-dashYellow"
                      : ""
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.5 rounded ${scoreBadge(
                      token1.data?.score
                    )}`}
                  >
                    {token1.data?.score !== null && token1.data?.score !== undefined
                      ? token1.data.score.toFixed(1)
                      : "N/A"}
                  </span>
                </td>
                <td
                  className={`py-2 px-3 ${
                    (token2.data?.score || 0) > (token1.data?.score || 0)
                      ? "ring-1 ring-dashYellow"
                      : ""
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.5 rounded ${scoreBadge(
                      token2.data?.score
                    )}`}
                  >
                    {token2.data?.score !== null && token2.data?.score !== undefined
                      ? token2.data.score.toFixed(1)
                      : "N/A"}
                  </span>
                </td>
              </tr>
              {canonicalChecklist.map(label => {
                const v1 = val(token1.data, label);
                const v2 = val(token2.data, label);
                const better = compareValue(v1, v2);
                return (
                  <tr key={label} className="border-b border-dashGreen-light">
                    <td className="py-2 px-3 font-semibold">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1">
                              {checklistIcons[label]}
                              {label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td
                      className={`py-2 px-3 ${
                        better === 1 ? "ring-1 ring-dashYellow" : ""
                      }`}
                    >
                      <span className={textColor(v1)}>{v1}</span>
                    </td>
                    <td
                      className={`py-2 px-3 ${
                        better === -1 ? "ring-1 ring-dashYellow" : ""
                      }`}
                    >
                      <span className={textColor(v2)}>{v2}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  );
}
