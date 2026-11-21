"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatLiveClock } from "@/lib/dateUtils";
import {
  Calendar as CalendarIcon,
  Plus,
  LogOut,
  Sparkles,
  ShieldCheck,
  Clock,
  User as UserIcon,
  BookOpen,
  BarChart3,
} from "lucide-react";

interface HeaderClockProps {
  onOpenNewMemory: () => void;
  onToggleMobileCalendar: () => void;
  entriesCount: number;
  currentView: "feed" | "analytics";
  onViewChange: (view: "feed" | "analytics") => void;
}

export const HeaderClock: React.FC<HeaderClockProps> = ({
  onOpenNewMemory,
  onToggleMobileCalendar,
  entriesCount,
  currentView,
  onViewChange,
}) => {
  const { user, isDemo, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const clockInfo = formatLiveClock(currentDate);

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 crystal-glass rounded-3xl px-5 py-3 transition-all duration-300">
        
        {/* Left: Brand & Mobile Calendar Trigger */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1.5px] shadow-[0_0_20px_-2px_rgba(99,102,241,0.5)]">
              <div className="w-full h-full bg-white/80 rounded-[14px] flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-900">
                  Daily Flow
                </h1>
                {isDemo ? (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-300/40">
                    Demo Mode
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-400/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Crystal Vault</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">
                Personal Story Diary • {entriesCount} {entriesCount === 1 ? "memory" : "memories"}
              </p>
            </div>
          </div>

          {/* Mobile Calendar Toggle Button */}
          <button
            onClick={onToggleMobileCalendar}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/40 hover:bg-white/60 text-xs font-semibold text-slate-800 border border-white/60 shadow-sm transition-all"
            aria-label="Toggle Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span>Calendar</span>
          </button>
        </div>

        {/* Center: Live Date & Clock Glass Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/35 backdrop-blur-xl border border-white/60 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] text-slate-800 text-sm font-medium">
          <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
          {mounted ? (
            <span className="tracking-tight text-slate-900">
              <span className="font-semibold">{clockInfo.dayOfWeek}</span>, {clockInfo.formattedDate}
              <span className="mx-2 text-slate-400">•</span>
              <span className="font-mono text-indigo-600 font-bold">{clockInfo.timeString}</span>
            </span>
          ) : (
            <span className="text-slate-400">Loading clock...</span>
          )}
        </div>

        {/* Right: View Switcher (Feed vs Analytics) & New Memory Action */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Apple VisionOS Style Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-inner">
            <button
              onClick={() => onViewChange("feed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentView === "feed"
                  ? "bg-white/75 text-indigo-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/30"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stories</span>
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                currentView === "analytics"
                  ? "bg-white/75 text-indigo-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/30"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trends</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse ml-0.5" />
            </button>
          </div>

          <button
            onClick={onOpenNewMemory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Memory</span>
          </button>

          {/* User Status & Sign Out */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/40">
            <div
              className="w-8 h-8 rounded-full bg-white/50 border border-white/70 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm"
              title={user?.email || "User"}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
