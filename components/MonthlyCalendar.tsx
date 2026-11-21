"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
  Filter,
} from "lucide-react";
import { getMonthMatrix, getTodayDateString, CalendarDay } from "@/lib/dateUtils";
import { DiaryEntry } from "@/lib/types";

interface MonthlyCalendarProps {
  entries: DiaryEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate,
  className = "",
}) => {
  const todayStr = getTodayDateString();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const memoryCountsByDate = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      if (e.entryDate) {
        map[e.entryDate] = (map[e.entryDate] || 0) + 1;
      }
    }
    return map;
  }, [entries]);

  const daysMatrix = getMonthMatrix(viewDate.year, viewDate.month);

  const prevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewDate({ year: now.getFullYear(), month: now.getMonth() });
    onSelectDate(todayStr);
  };

  return (
    <div className={`crystal-glass rounded-3xl p-5 ${className}`}>
      {/* Calendar Header with Month/Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>{MONTH_NAMES[viewDate.month]}</span>
            <span className="text-slate-500 font-normal">{viewDate.year}</span>
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Select a date to filter daily memories
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={jumpToToday}
            className="p-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white/40 transition-colors text-xs font-medium"
            title="Jump to Today"
            aria-label="Jump to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAY_NAMES.map((w, idx) => (
          <span
            key={idx}
            className={`text-[11px] font-semibold py-1 ${
              idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysMatrix.map((day: CalendarDay) => {
          const hasMemories = Boolean(memoryCountsByDate[day.dateString]);
          const memoryCount = memoryCountsByDate[day.dateString] || 0;
          const isSelected = selectedDate === day.dateString;
          const isToday = day.isToday;

          return (
            <button
              key={day.dateString}
              onClick={() => onSelectDate(isSelected ? null : day.dateString)}
              className={`group relative flex flex-col items-center justify-center h-10 w-full rounded-2xl text-xs font-medium transition-all duration-200 ${
                !day.isCurrentMonth
                  ? "text-slate-300 hover:text-slate-500"
                  : isSelected
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.5)] scale-105 font-bold z-10"
                  : isToday
                  ? "bg-white/60 text-indigo-700 font-bold border border-indigo-300/80 shadow-sm hover:bg-white/80"
                  : "text-slate-800 hover:bg-white/40 hover:shadow-sm"
              }`}
            >
              <span>{day.dayNumber}</span>

              {/* Glowing Indicator Dot for Days with Diary Entries */}
              {hasMemories && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-300 shadow-[0_0_6px_#fde047]"
                      : isToday
                      ? "bg-indigo-600 shadow-[0_0_6px_rgba(79,70,229,0.9)]"
                      : "bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)] animate-pulse"
                  }`}
                  title={`${memoryCount} ${memoryCount === 1 ? "entry" : "entries"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Status & Reset Action */}
      <div className="mt-4 pt-3.5 border-t border-white/40 flex items-center justify-between text-xs">
        {selectedDate ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 text-indigo-800 font-medium truncate">
              <Filter className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" />
              <span className="truncate">Filtered: {selectedDate}</span>
            </div>
            <button
              onClick={() => onSelectDate(null)}
              className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-white/50 hover:bg-white/70 text-indigo-700 font-semibold text-[11px] transition-colors border border-white/60 shadow-sm"
            >
              Show All
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-600">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{entries.length} memories recorded</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {Object.keys(memoryCountsByDate).length} active days
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
