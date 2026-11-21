"use client";

import React from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { DiaryEntry } from "@/lib/types";

interface MobileCalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

export const MobileCalendarDrawer: React.FC<MobileCalendarDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  selectedDate,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in md:hidden">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md liquid-glass-modal rounded-t-3xl sm:rounded-3xl p-5 shadow-liquid-lg animate-scale-up border border-white/80 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Calendar Navigator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <MonthlyCalendar
          entries={entries}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            onSelectDate(date);
            onClose();
          }}
          className="border-0 shadow-none p-0 bg-transparent"
        />
      </div>
    </div>
  );
};
