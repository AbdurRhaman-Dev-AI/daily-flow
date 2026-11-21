"use client";

import React from "react";
import { BarChart3, TrendingUp, CalendarDays, ArrowRight, Flame } from "lucide-react";
import { DiaryEntry } from "@/lib/types";
import { computeActivityAnalytics } from "@/lib/analyticsUtils";

interface MiniAnalyticsWidgetProps {
  entries: DiaryEntry[];
  onOpenFullAnalytics: () => void;
}

export const MiniAnalyticsWidget: React.FC<MiniAnalyticsWidgetProps> = ({
  entries,
  onOpenFullAnalytics,
}) => {
  const analytics = computeActivityAnalytics(entries);

  return (
    <div className="crystal-glass rounded-3xl p-5 space-y-4">
      {/* Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-700">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-900">
            Activity Flow
          </span>
        </div>

        <button
          onClick={onOpenFullAnalytics}
          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-white/40"
        >
          <span>View Trends</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Week & Month Metric Pills */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-2xl bg-white/25 border border-white/40 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">This Week</span>
          <span className="text-base font-extrabold text-slate-900">{analytics.thisWeekCount}</span>
          <span className="text-[10px] text-slate-500 block">
            {analytics.weekChangePercentage >= 0 ? "+" : ""}{analytics.weekChangePercentage}% vs prior
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/25 border border-white/40 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">This Month</span>
          <span className="text-base font-extrabold text-indigo-700">{analytics.thisMonthCount}</span>
          <span className="text-[10px] text-slate-500 block">
            {analytics.monthChangePercentage >= 0 ? "+" : ""}{analytics.monthChangePercentage}% vs prior
          </span>
        </div>
      </div>

      {/* 7-Day Mini Sparkline Grid */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1.5 px-0.5">
          <span>Last 7 Days</span>
          {analytics.activeStreak > 0 && (
            <span className="text-amber-700 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span>{analytics.activeStreak}d streak</span>
            </span>
          )}
        </div>

        <div className="flex items-end gap-1.5 h-10 w-full px-1">
          {analytics.currentWeekDays.map((d) => {
            const heightPct = d.count > 0 ? Math.min(d.count * 30, 100) : 15;
            return (
              <div
                key={d.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                title={`${d.dayName}: ${d.count} memories`}
              >
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-md transition-all ${
                    d.isToday
                      ? "bg-indigo-600 shadow-sm"
                      : d.count > 0
                      ? "bg-indigo-500/80"
                      : "bg-white/25"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
