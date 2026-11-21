"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthScreen } from "@/components/AuthScreen";
import { HeaderClock } from "@/components/HeaderClock";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { MiniAnalyticsWidget } from "@/components/MiniAnalyticsWidget";
import { ActivityAnalytics } from "@/components/ActivityAnalytics";
import { MemoryCard } from "@/components/MemoryCard";
import { MemoryComposerModal } from "@/components/MemoryComposerModal";
import { MemoryEditModal } from "@/components/MemoryEditModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { MediaLightbox } from "@/components/MediaLightbox";
import { MobileCalendarDrawer } from "@/components/MobileCalendarDrawer";
import { FeedControls } from "@/components/FeedControls";
import { PrivacyCard } from "@/components/PrivacyCard";
import {
  fetchUserEntries,
  deleteDiaryEntry,
} from "@/services/diaryService";
import { DiaryEntry, MediaItem } from "@/lib/types";
import {
  Sparkles,
  Plus,
  BookOpen,
  Loader2,
} from "lucide-react";

export default function DailyFlowApp() {
  const { user, loading: authLoading, isDemo } = useAuth();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  // Active View: Feed or Analytics
  const [activeView, setActiveView] = useState<"feed" | "analytics">("feed");

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">("all");

  // Modal States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DiaryEntry | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    mediaList: MediaItem[];
    index: number;
  } | null>(null);

  // Fetch entries when user changes
  useEffect(() => {
    let active = true;
    if (!user) {
      setEntries([]);
      setEntriesLoading(false);
      return;
    }

    const loadEntries = async () => {
      setEntriesLoading(true);
      try {
        const data = await fetchUserEntries(user.uid, isDemo);
        if (active) {
          setEntries(data);
        }
      } catch (err: any) {
        console.info("Notice loading entries:", err);
      } finally {
        if (active) {
          setEntriesLoading(false);
        }
      }
    };

    loadEntries();
    return () => { active = false; };
  }, [user, isDemo]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedDate && entry.entryDate !== selectedDate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !entry.title.toLowerCase().includes(q) &&
          !entry.content.toLowerCase().includes(q)
        )
          return false;
      }
      if (mediaFilter === "images" && !(entry.media || []).some((m) => m.type === "image"))
        return false;
      if (mediaFilter === "videos" && !(entry.media || []).some((m) => m.type === "video"))
        return false;
      return true;
    });
  }, [entries, selectedDate, searchQuery, mediaFilter]);

  // CRUD handlers
  const handleEntryCreated = (newEntry: DiaryEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    if (selectedDate && selectedDate !== newEntry.entryDate) {
      setSelectedDate(newEntry.entryDate);
    }
  };

  const handleEntryUpdated = (updated: DiaryEntry) => {
    setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleConfirmDelete = async (entry: DiaryEntry) => {
    if (!user) return;
    await deleteDiaryEntry(user.uid, entry.id, entry.media || [], isDemo);
    setEntries((prev) => prev.filter((item) => item.id !== entry.id));
  };

  const handleOpenLightbox = (mediaList: MediaItem[], index: number) => {
    setLightboxData({ mediaList, index });
  };

  const handleDateSelectFromChart = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveView("feed"); // Jump back to story feed with date filtered
  };

  // ── Auth loading ──
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="crystal-glass rounded-3xl p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Opening Daily Flow...</span>
        </div>
      </div>
    );
  }

  // ── Unauthenticated ──
  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen w-full flex flex-col pb-16 selection:bg-indigo-500/20 relative">
      {/* Ambient Crystal Light Orbs (Refracts through the crystal glass panels) */}
      <div className="fixed top-20 left-10 w-96 h-96 rounded-full bg-indigo-300/35 blur-[90px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 right-12 w-[32rem] h-[32rem] rounded-full bg-purple-300/30 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/4 w-[28rem] h-[28rem] rounded-full bg-pink-200/35 blur-[90px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 rounded-full bg-sky-200/40 blur-[80px] pointer-events-none -z-10" />

      {/* Header Dock */}
      <HeaderClock
        onOpenNewMemory={() => setIsComposerOpen(true)}
        onToggleMobileCalendar={() => setIsMobileCalendarOpen(true)}
        entriesCount={entries.length}
        currentView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-5 flex-1 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* Left Column: Calendar, Mini Activity Widget, Privacy Card */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-4 space-y-5 sticky top-24">
            <MonthlyCalendar
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                if (activeView !== "feed") setActiveView("feed");
              }}
            />

            <MiniAnalyticsWidget
              entries={entries}
              onOpenFullAnalytics={() => setActiveView("analytics")}
            />

            <PrivacyCard />
          </aside>

          {/* Right Column: Switcher between Story Feed & Activity Analytics */}
          <section className="md:col-span-8 lg:col-span-8 space-y-6">
            
            {activeView === "analytics" ? (
              /* ── Full Activity Analytics Dashboard ── */
              <ActivityAnalytics
                entries={entries}
                onSelectDate={handleDateSelectFromChart}
              />
            ) : (
              /* ── Stories Diary Feed ── */
              <>
                <FeedControls
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  mediaFilter={mediaFilter}
                  onMediaFilterChange={setMediaFilter}
                  selectedDate={selectedDate}
                  onClearDateFilter={() => setSelectedDate(null)}
                  totalEntriesCount={entries.length}
                  filteredCount={filteredEntries.length}
                />

                {/* Feed Cards */}
                {entriesLoading ? (
                  <div className="crystal-glass rounded-3xl p-12 text-center flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium text-slate-700">Loading your story diary...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="crystal-glass rounded-3xl p-10 sm:p-14 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white/40 border border-white/60 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
                      <BookOpen className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedDate
                          ? `No memories found on ${selectedDate}`
                          : searchQuery
                          ? "No memories match your search"
                          : "Your story diary is waiting for its first page"}
                      </h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                        {selectedDate || searchQuery
                          ? "Try resetting filters or picking a different date on the calendar."
                          : "Capture today's reflections, milestones, photos, and videos with crystal clarity."}
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-3">
                      {(selectedDate || searchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedDate(null);
                            setSearchQuery("");
                            setMediaFilter("all");
                          }}
                          className="px-4 py-2 rounded-2xl bg-white/40 hover:bg-white/60 text-slate-800 text-xs font-semibold border border-white/60 shadow-sm transition-all"
                        >
                          Show All Memories
                        </button>
                      )}
                      <button
                        onClick={() => setIsComposerOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Memory</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredEntries.map((entry) => (
                      <MemoryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={(e) => setEditingEntry(e)}
                        onDelete={(e) => setDeletingEntry(e)}
                        onOpenLightbox={handleOpenLightbox}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      <MemoryComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onEntryCreated={handleEntryCreated}
        defaultDate={selectedDate}
      />
      {editingEntry && (
        <MemoryEditModal
          entry={editingEntry}
          isOpen={Boolean(editingEntry)}
          onClose={() => setEditingEntry(null)}
          onEntryUpdated={handleEntryUpdated}
        />
      )}
      {deletingEntry && (
        <DeleteConfirmModal
          entry={deletingEntry}
          isOpen={Boolean(deletingEntry)}
          onClose={() => setDeletingEntry(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {lightboxData && (
        <MediaLightbox
          mediaList={lightboxData.mediaList}
          initialIndex={lightboxData.index}
          onClose={() => setLightboxData(null)}
        />
      )}
      <MobileCalendarDrawer
        isOpen={isMobileCalendarOpen}
        onClose={() => setIsMobileCalendarOpen(false)}
        entries={entries}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setActiveView("feed");
        }}
      />
    </div>
  );
}
