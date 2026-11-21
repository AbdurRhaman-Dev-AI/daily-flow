"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Maximize2,
  Film,
  Image as ImageIcon,
  Share2,
  Check,
  AlertCircle,
} from "lucide-react";
import { DiaryEntry, MediaItem } from "@/lib/types";
import { formatDisplayDate, formatTimeFromTimestamp } from "@/lib/dateUtils";

interface MemoryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
  onOpenLightbox: (mediaList: MediaItem[], index: number) => void;
}

const PhotoTile: React.FC<{
  img: MediaItem;
  idx: number;
  onClick: () => void;
  onEdit: () => void;
}> = ({ img, idx, onClick, onEdit }) => {
  const [hasError, setHasError] = useState(false);

  // If URL is an expired blob from a previous session, detect it early
  const isExpiredBlob = !hasError && img.url?.startsWith("blob:");

  if (hasError) {
    return (
      <div
        onClick={onEdit}
        className="group/err relative overflow-hidden rounded-2xl bg-white/25 border border-white/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer aspect-square sm:aspect-[4/3] backdrop-blur-md shadow-inner hover:bg-white/40 transition-all"
        title="Click to edit and re-attach photo"
      >
        <ImageIcon className="w-6 h-6 text-slate-400 mb-1 group-hover/err:text-indigo-500 transition-colors" />
        <span className="text-[11px] font-medium text-slate-600 line-clamp-1 max-w-[90%]">
          {img.name || `Photo ${idx + 1}`}
        </span>
        <span className="text-[10px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
          <Edit2 className="w-3 h-3" /> Re-attach Photo
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group/img relative overflow-hidden rounded-2xl bg-white/20 border border-white/50 shadow-sm cursor-pointer aspect-square sm:aspect-[4/3] backdrop-blur-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.name || `Photo ${idx + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      {/* Hover Overlay with Lightbox Trigger */}
      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-md text-slate-800 shadow-md transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
          <Maximize2 className="w-4 h-4 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};

export const MemoryCard: React.FC<MemoryCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onOpenLightbox,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = formatDisplayDate(entry.entryDate);
  const timeWritten = formatTimeFromTimestamp(entry.createdAt);

  const images = (entry.media || []).filter((m) => m.type === "image");
  const videos = (entry.media || []).filter((m) => m.type === "video");

  const handleCopyText = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(`${entry.title}\n\n${entry.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }
  };

  return (
    <article className="group relative crystal-glass rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:border-white/90">
      {/* Card Header: Date & Time Badges + Action Menu */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Formatted Date Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/45 backdrop-blur-md border border-white/60 text-xs font-semibold text-slate-800 shadow-sm">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formattedDate}</span>
          </div>

          {/* Exact Time Written Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-xs font-medium text-slate-600">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{timeWritten}</span>
          </div>

          {/* Media Count Badges if present */}
          {images.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white/35 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/40">
              <ImageIcon className="w-3 h-3 text-indigo-500" />
              <span>{images.length}</span>
            </span>
          )}
          {videos.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white/35 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/40">
              <Film className="w-3 h-3 text-purple-500" />
              <span>{videos.length}</span>
            </span>
          )}
        </div>

        {/* Card Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white/50 transition-colors"
            title="Entry Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-30 w-36 rounded-2xl crystal-glass-modal p-1.5 shadow-2xl animate-scale-up text-xs font-medium text-slate-800">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(entry);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-white/60 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Story</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-white/60 hover:text-slate-900 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Note"}</span>
                </button>
                <div className="my-1 border-t border-white/40" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(entry);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Story Title */}
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-3 group-hover:text-indigo-950 transition-colors">
        {entry.title}
      </h3>

      {/* Full Story Content Text */}
      <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal mb-5">
        {entry.content}
      </p>

      {/* Media Gallery: Photos & Videos */}
      {entry.media && entry.media.length > 0 && (
        <div className="mt-4 space-y-3">
          {/* Videos: Play Inline with native controls in crystal glass frame */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {videos.map((vid, idx) => (
                <div
                  key={`video-${idx}`}
                  className="relative overflow-hidden rounded-2xl bg-black/10 border border-white/60 shadow-inner aspect-video max-h-[380px]"
                >
                  <video
                    src={vid.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black/50 rounded-2xl"
                  />
                  <div className="absolute top-2.5 right-2.5 pointer-events-none px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-white/90 font-medium flex items-center gap-1">
                    <Film className="w-2.5 h-2.5" />
                    <span>Video</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photos: Inline Gallery with Lightbox Previews & Error Recovery */}
          {images.length > 0 && (
            <div
              className={`grid gap-2.5 ${
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                  ? "grid-cols-2"
                  : images.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {images.map((img, idx) => (
                <PhotoTile
                  key={`img-${idx}-${img.name}`}
                  img={img}
                  idx={idx}
                  onClick={() => onOpenLightbox(entry.media, idx)}
                  onEdit={() => onEdit(entry)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Footer Info */}
      <div className="mt-5 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-slate-500">
        <span>Recorded in Daily Flow</span>
        {entry.updatedAt && (
          <span className="italic text-[11px] text-slate-500">Edited</span>
        )}
      </div>
    </article>
  );
};
