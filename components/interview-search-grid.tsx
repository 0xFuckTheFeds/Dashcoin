"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import InterviewCard from "@/components/interview-card";
import { Interview } from "@/data/interviews";
import { MessageCircle, Mic } from "lucide-react";

interface Props {
  interviews: Interview[];
}

export default function InterviewSearchGrid({ interviews }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return interviews;
    const term = searchTerm.toLowerCase();
    return interviews.filter((i) => i.project.toLowerCase().includes(term));
  }, [searchTerm, interviews]);

  return (
    <div className="relative z-10 container mx-auto px-6 pb-16 max-w-7xl">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 via-green-600 to-teal-600 rounded-2xl shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Interviews</h2>
            <p className="text-slate-400">In-depth conversations with industry leaders</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a coin"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Interview Grid */}
      {filtered && filtered.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((interview) => (
            <div key={interview.id} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/10">
                <InterviewCard interview={interview} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No interviews available</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">We're working on bringing you exclusive conversations with top founders. Check back soon for new content.</p>
        </div>
      )}
    </div>
  );
}
