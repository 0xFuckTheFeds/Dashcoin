"use client";

import { useState, useMemo } from "react";
import InterviewCard from "./interview-card";
import { Interview } from "@/data/interviews";
import { Star, Calendar, TrendingUp, Mic } from "lucide-react";

interface InterviewListProps {
  interviews: Interview[];
}

export default function InterviewList({ interviews }: InterviewListProps) {
  const [sort, setSort] = useState<"featured" | "recent" | "popular">("featured");

  const sorted = useMemo(() => {
    const arr = [...interviews];
    if (sort === "recent") {
      arr.sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
    } else if (sort === "popular") {
      arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return arr;
  }, [interviews, sort]);

  const buttonClasses = (type: string) =>
    `flex items-center gap-2 px-4 py-2 transition-colors ${
      sort === type ? "text-white" : "text-slate-400 hover:text-white"
    }`;

  return (
    <>
      <div className="hidden md:flex items-center gap-3 mb-10 justify-end">
        <button className={buttonClasses("featured")} onClick={() => setSort("featured")}>\
          <Star className="w-4 h-4" />
          <span className="text-sm">Featured</span>
        </button>
        <button className={buttonClasses("recent")} onClick={() => setSort("recent")}>\
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Recent</span>
        </button>
        <button className={buttonClasses("popular")} onClick={() => setSort("popular")}>\
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Popular</span>
        </button>
      </div>
      {sorted && sorted.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((interview) => (
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
    </>
  );
}
