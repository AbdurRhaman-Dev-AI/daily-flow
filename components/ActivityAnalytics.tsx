"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Flame,
  Camera,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  CalendarDays,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { DiaryEntry } from "@/lib/types";
import { computeActivityAnalytics, DailyActivityPoint, MonthComparisonItem } from "@/lib/analyticsUtils";
import { formatDisplayDate } from "@/lib/dateUtils";

interface ActivityAnalyticsProps {
  entries: DiaryEntry[];
  onSelectDate: (dateStr: string) => void;
  onClose?: () => void;
}

export const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({
  entries,
  onSelectDate,
}) => {
  const [dailyViewRange, setDailyViewRange] = useState<"14" | "30">("14");
  const [hoveredDay, setHoveredDay] = useState<DailyActivityPoint | null>(null);

  const analytics = computeActivityAnalytics(entries);
  const dailyPoints = dailyViewRange === "14" ? analytics.dailyPoints14Days : analytics.dailyPoints30Days;
  const maxDailyCount = Math.max(...dailyPoints.map((p) => p.count), 3);

  // For monthly comparison chart
  const monthsData = [...analytics.monthlyComparisons].reverse(); // chronological for chart
  const maxMonthCount = Math.max(...monthsData.map((m) => m.totalEntries), 4);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── 1. Top KPI Stat Cards (Apple Crystal Tiles) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Activities */}
        <div className="crystal-glass rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/90 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Today</span>
            <div className="w-8 h-8 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {analytics.todayCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {analytics.todayCount === 1 ? "memory written today" : "memories written today"}
            </p>
          </div>
        </div>

        {/* This Week's Total */}
        <div className="crystal-glass rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/90 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">This Week</span>
            <div className="w-8 h-8 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-700">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {analytics.thisWeekCount}
              </span>
              {analytics.lastWeekCount > 0 && (
                <span
                  className={`text-[11px] font-bold flex items-center ${
                    analytics.weekChangePercentage >= 0
                      ? "text-emerald-700"
                      : "text-rose-600"
                  }`}
                >
                  {analytics.weekChangePercentage >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {Math.abs(analytics.weekChangePercentage)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              vs {analytics.lastWeekCount} last week
            </p>
          </div>
        </div>

        {/* This Month's Total */}
        <div className="crystal-glass rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/90 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">This Month</span>
            <div className="w-8 h-8 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-700">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {analytics.thisMonthCount}
              </span>
              {analytics.lastMonthCount > 0 && (
                <span
                  className={`text-[11px] font-bold flex items-center ${
                    analytics.monthChangePercentage >= 0
                      ? "text-emerald-700"
                      : "text-rose-600"
                  }`}
                >
                  {analytics.monthChangePercentage >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {Math.abs(analytics.monthChangePercentage)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              vs {analytics.lastMonthCount} last month
            </p>
          </div>
        </div>

        {/* Media & Flow Streak */}
        <div className="crystal-glass rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/90 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Active Streak</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {analytics.activeStreak}
              </span>
              <span className="text-xs font-semibold text-amber-700">
                {analytics.activeStreak === 1 ? "day streak" : "days streak"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Camera className="w-3 h-3 text-slate-400" />
              <span>{analytics.totalMediaCount} media items captured</span>
            </p>
          </div>
        </div>

      </div>

      {/* ── 2. Daily Activity Chart ("How many activity did in which date") ── */}
      <div className="crystal-glass rounded-4xl p-5 sm:p-7 space-y-4">
        
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-700 shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Daily Activity Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any bar to filter and view memories from that date
            </p>
          </div>

          {/* Range Switcher (14 Days vs 30 Days) */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/30 border border-white/50 backdrop-blur-md">
            <button
              onClick={() => setDailyViewRange("14")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dailyViewRange === "14"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/40"
              }`}
            >
              Last 14 Days
            </button>
            <button
              onClick={() => setDailyViewRange("30")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dailyViewRange === "30"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/40"
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Hovered Date Card Tooltip */}
        <div className="h-10 flex items-center px-4 rounded-2xl bg-white/25 border border-white/40 text-xs font-medium text-slate-700">
          {hoveredDay ? (
            <div className="flex items-center justify-between w-full truncate">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                {hoveredDay.dayLabel}:
                <span className="text-indigo-700 font-extrabold">{hoveredDay.count} {hoveredDay.count === 1 ? "activity" : "activities"}</span>
              </span>
              {hoveredDay.entries.length > 0 && (
                <span className="text-slate-500 text-[11px] truncate ml-3 hidden sm:inline">
                  &ldquo;{hoveredDay.entries[0].title}&rdquo; {hoveredDay.entries.length > 1 && `+ ${hoveredDay.entries.length - 1} more`}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 text-[11px]">
              Hover over or tap any date bar to inspect details and jump to memories
            </span>
          )}
        </div>

        {/* SVG/CSS Bar Chart Grid */}
        <div className="pt-2">
          <div className="flex items-end gap-1.5 sm:gap-2 h-44 sm:h-52 w-full px-1 pb-4 border-b border-white/40 overflow-x-auto">
            {dailyPoints.map((point) => {
              const heightPercent = point.count > 0 ? Math.max((point.count / maxDailyCount) * 100, 15) : 6;
              const hasActivity = point.count > 0;

              return (
                <div
                  key={point.dateStr}
                  onMouseEnter={() => setHoveredDay(point)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => onSelectDate(point.dateStr)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group min-w-[20px] transition-transform hover:scale-105"
                  title={`${point.dayLabel}: ${point.count} memories`}
                >
                  {/* Activity Count Tag Above Bar */}
                  {point.count > 0 && (
                    <span className="text-[10px] font-extrabold text-indigo-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.count}
                    </span>
                  )}

                  {/* Visual Luminous Glass Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 relative ${
                      point.isToday
                        ? "bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-400 shadow-[0_0_16px_rgba(99,102,241,0.6)] border-t border-x border-white/80"
                        : hasActivity
                        ? "bg-gradient-to-t from-indigo-500/80 to-purple-500/80 group-hover:from-indigo-600 group-hover:to-purple-600 border-t border-x border-white/60 shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
                        : "bg-white/20 group-hover:bg-white/40 border-t border-white/40"
                    }`}
                  >
                    {/* Top Shine Specular on active bars */}
                    {hasActivity && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/70 rounded-t-xl" />
                    )}
                  </div>

                  {/* Day Label Below */}
                  <div className="mt-2 text-[10px] font-semibold text-slate-600 group-hover:text-indigo-900 transition-colors">
                    {point.dayOfWeek.slice(0, 2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── 3. This Week's Breakdown ("How much activity happened that week") ── */}
      <div className="crystal-glass rounded-4xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-700 shadow-sm">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                This Week&apos;s Velocity
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {analytics.thisWeekCount} total {analytics.thisWeekCount === 1 ? "activity" : "activities"} this week
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-white/35 backdrop-blur-md border border-white/50 text-xs font-semibold text-indigo-800">
            {analytics.weekChangePercentage >= 0 ? "+" : ""}{analytics.weekChangePercentage}% vs prior week
          </div>
        </div>

        {/* 7-Day Weekday Cards */}
        <div className="grid grid-cols-7 gap-2">
          {analytics.currentWeekDays.map((w) => (
            <div
              key={w.dateStr}
              onClick={() => onSelectDate(w.dateStr)}
              className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-between text-center cursor-pointer transition-all ${
                w.isToday
                  ? "bg-white/60 border border-indigo-400 shadow-md scale-105"
                  : w.count > 0
                  ? "bg-white/35 border border-white/60 hover:bg-white/50 shadow-sm"
                  : "bg-white/15 border border-white/30 hover:bg-white/30"
              }`}
            >
              <span className={`text-[11px] font-bold ${w.isToday ? "text-indigo-700" : "text-slate-600"}`}>
                {w.dayName}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 my-1">
                {w.count}
              </span>
              {w.count > 0 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              ) : (
                <span className="text-[10px] text-slate-400">•</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Month-over-Month Comparison ("Compairason every month end with other month activity data") ── */}
      <div className="crystal-glass rounded-4xl p-5 sm:p-7 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-700 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Month-End Activity Comparison
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Comparative analysis of notes, media, and flow consistency across every month
              </p>
            </div>
          </div>
        </div>

        {/* Comparative Monthly Visual Chart */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/20 border border-white/40 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">
            Monthly Entries Volume Comparison
          </span>

          <div className="flex items-end gap-3 sm:gap-6 h-36 w-full pt-4 pb-2 border-b border-white/30 px-2 overflow-x-auto">
            {monthsData.map((m) => {
              const heightPercent = m.totalEntries > 0 ? Math.max((m.totalEntries / maxMonthCount) * 100, 15) : 8;

              return (
                <div key={m.monthKey} className="flex-1 flex flex-col items-center h-full justify-end min-w-[50px] group">
                  <span className="text-xs font-extrabold text-indigo-700 mb-1">
                    {m.totalEntries}
                  </span>
                  
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-400 shadow-[0_4px_16px_rgba(99,102,241,0.25)] border-t border-x border-white/70 relative group-hover:scale-105 transition-transform"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/80 rounded-t-xl" />
                  </div>

                  {/* Month Label */}
                  <span className="mt-2 text-xs font-bold text-slate-700 truncate">
                    {m.shortMonth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Month-End Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {analytics.monthlyComparisons.map((item, idx) => {
            const hasGrowth = item.prevMonthDiff >= 0;
            const isFirst = idx === 0;

            return (
              <div
                key={item.monthKey}
                className="p-4 sm:p-5 rounded-3xl bg-white/30 backdrop-blur-md border border-white/60 hover:bg-white/45 transition-all shadow-sm space-y-3"
              >
                {/* Month Name & Comparison Delta Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {item.monthName}
                    </span>
                    {isFirst && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-800 border border-indigo-400/40">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Month-over-Month Delta Indicator */}
                  {item.prevMonthDiff !== 0 ? (
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        hasGrowth
                          ? "bg-emerald-500/15 text-emerald-800 border-emerald-400/40"
                          : "text-rose-700 bg-rose-500/15 border-rose-400/40"
                      }`}
                    >
                      {hasGrowth ? (
                        <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>
                        {hasGrowth ? "+" : ""}
                        {item.prevMonthDiff} ({item.percentageChange > 0 ? "+" : ""}{item.percentageChange}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold px-2 py-1 rounded-xl bg-white/30">
                      Baseline
                    </span>
                  )}
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/40 text-center">
                  <div className="p-2 rounded-2xl bg-white/20">
                    <span className="text-[10px] font-semibold text-slate-500 block">Total Notes</span>
                    <span className="text-sm font-extrabold text-slate-900">{item.totalEntries}</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white/20">
                    <span className="text-[10px] font-semibold text-slate-500 block">Active Days</span>
                    <span className="text-sm font-extrabold text-indigo-700">{item.activeDaysCount}</span>
                  </div>

                  <div className="p-2 rounded-2xl bg-white/20">
                    <span className="text-[10px] font-semibold text-slate-500 block">Photos & Vids</span>
                    <span className="text-sm font-extrabold text-purple-700">
                      {item.totalImages + item.totalVideos}
                    </span>
                  </div>
                </div>

                {/* Footer Insight */}
                <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                  {item.mostActiveDate ? (
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Peak Day: <strong className="text-slate-800">{formatDisplayDate(item.mostActiveDate)}</strong></span>
                    </span>
                  ) : (
                    <span>No entries recorded</span>
                  )}

                  <span className="font-semibold text-indigo-700">
                    {item.totalEntries > 0 ? `${(item.totalEntries / Math.max(item.activeDaysCount, 1)).toFixed(1)} avg/active day` : ""}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
