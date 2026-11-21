"use client";

import React from "react";
import { Search, X, Image as ImageIcon, Film, Layers, Filter } from "lucide-react";
import { formatDisplayDate } from "@/lib/dateUtils";

interface FeedControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mediaFilter: "all" | "images" | "videos";
  onMediaFilterChange: (filter: "all" | "images" | "videos") => void;
  selectedDate: string | null;
  onClearDateFilter: () => void;
  totalEntriesCount: number;
  filteredCount: number;
}

export const FeedControls: React.FC<FeedControlsProps> = ({
  searchQuery,
  onSearchChange,
  mediaFilter,
  onMediaFilterChange,
  selectedDate,
  onClearDateFilter,
  totalEntriesCount,
  filteredCount,
}) => {
  return (
    <div className="crystal-glass rounded-3xl p-4 sm:p-5 space-y-3">
      {/* Search Input & Media Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, feelings, titles..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl crystal-input text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Media Type Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => onMediaFilterChange("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
              mediaFilter === "all"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-white/40 hover:text-slate-900 font-medium"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All</span>
          </button>
          <button
            onClick={() => onMediaFilterChange("images")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
              mediaFilter === "images"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-white/40 hover:text-slate-900 font-medium"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => onMediaFilterChange("videos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
              mediaFilter === "videos"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-white/40 hover:text-slate-900 font-medium"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>
        </div>
      </div>

      {/* Active Filter Indicators Bar */}
      {(selectedDate || searchQuery) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/40 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {selectedDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/45 backdrop-blur-md border border-white/60 text-indigo-800 font-semibold shadow-sm">
                <Filter className="w-3 h-3 text-indigo-600" />
                <span>Date: {formatDisplayDate(selectedDate)}</span>
                <button
                  onClick={onClearDateFilter}
                  className="hover:text-indigo-950 ml-0.5"
                  title="Remove date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-slate-800 font-medium shadow-sm">
                <span>Matching &ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={() => onSearchChange("")}
                  className="hover:text-slate-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-[11px]">
              Showing {filteredCount} of {totalEntriesCount} {totalEntriesCount === 1 ? "entry" : "entries"}
            </span>
            <button
              onClick={() => {
                onClearDateFilter();
                onSearchChange("");
              }}
              className="px-2.5 py-1 rounded-xl bg-white/50 hover:bg-white/70 text-indigo-700 font-semibold text-[11px] border border-white/60 shadow-sm transition-colors"
            >
              Show All Memories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
