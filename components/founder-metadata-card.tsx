"use client";

import {
  DashcoinCard,
  DashcoinCardHeader,
  DashcoinCardTitle,
  DashcoinCardContent,
} from "@/components/ui/dashcoin-card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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

function valueColor(value: any): string {
  const score = valueToScore(value);
  if (score === 2) return "text-green-500";
  if (score === 1) return "text-yellow-400";
  return "text-gray-400";
}

interface ResearchData {
  symbol: string;
  score: number | null;
  [key: string]: any;
}

interface FounderMetadataCardProps {
  name: string;
  symbol: string;
  data?: ResearchData;
}

export function FounderMetadataCard({ name, symbol, data }: FounderMetadataCardProps) {
  return (
    <DashcoinCard className="p-4 space-y-2">
      <DashcoinCardHeader>
        <DashcoinCardTitle className="text-lg font-bold">
          {name} ({symbol})
        </DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="text-sm">
          <div className="grid grid-cols-[auto,1fr] gap-2 py-1 border-b border-dashGreen-light">
            <div className="flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4" /> Research Score
            </div>
            <div className="text-right">
              {data && data.score !== null && data.score !== undefined ? data.score.toFixed(1) : "N/A"}
            </div>
          </div>
          {canonicalChecklist.map(label => (
            <TooltipProvider delayDuration={0} key={label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="grid grid-cols-[auto,1fr] gap-2 py-1 border-b last:border-none border-dashGreen-light hover:bg-dashGreen-dark/30">
                    <div className="flex items-center gap-2 font-semibold">
                      {checklistIcons[label]}
                      {label}
                    </div>
                    <div className={`text-right ${valueColor(data ? data[label] : null)}`}>{data && data[label] ? data[label] : "N/A"}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  );
}

