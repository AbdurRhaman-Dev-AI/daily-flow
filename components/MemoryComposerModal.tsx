"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Film,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/dateUtils";
import { uploadMediaFile, createDiaryEntry, fileToDataUrl } from "@/services/diaryService";
import { DiaryEntry, MediaItem } from "@/lib/types";

interface MemoryComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated: (entry: DiaryEntry) => void;
  defaultDate?: string | null;
}

interface StagedFile {
  file: File;
  previewUrl: string;
  type: "image" | "video";
  id: string;
}

export const MemoryComposerModal: React.FC<MemoryComposerModalProps> = ({
  isOpen,
  onClose,
  onEntryCreated,
  defaultDate,
}) => {
  const { user, isDemo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(defaultDate || getTodayDateString());
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileUploading, setCurrentFileUploading] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newStaged: StagedFile[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      // Generate permanent Base64 preview so it never expires
      const previewUrl = await fileToDataUrl(file);
      newStaged.push({
        file,
        previewUrl,
        type: isVideo ? "video" : "image",
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      });
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please give your memory a title.");
      return;
    }
    if (!content.trim()) {
      setError("Please write down your story note.");
      return;
    }
    if (!user) {
      setError("You must be signed in to save memories.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const uploadedMedia: MediaItem[] = [];

      // Upload each file
      if (stagedFiles.length > 0) {
        for (let i = 0; i < stagedFiles.length; i++) {
          const staged = stagedFiles[i];
          setCurrentFileUploading(`Processing ${staged.file.name}...`);

          const mediaItem = await uploadMediaFile(
            user.uid,
            entryId,
            staged.file,
            (progress) => {
              const totalFraction = (i + progress / 100) / stagedFiles.length;
              setUploadProgress(Math.round(totalFraction * 100));
            }
          );
          uploadedMedia.push(mediaItem);
        }
      }

      setUploadProgress(100);
      setCurrentFileUploading("Saving your story...");

      // Save document
      const newEntry = await createDiaryEntry(
        user.uid,
        {
          title: title.trim(),
          content: content.trim(),
          entryDate,
          media: uploadedMedia,
        },
        isDemo
      );

      onEntryCreated(newEntry);
      onClose();
    } catch (err: any) {
      console.error("Save memory error:", err);
      setError(err?.message || "Failed to save memory.");
    } finally {
      setIsUploading(false);
      setCurrentFileUploading("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/30 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl crystal-glass-modal rounded-4xl p-6 sm:p-8 my-8 shadow-2xl animate-scale-up border border-white/80">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/40 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/50 border border-white/60 flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                New Memory
              </h2>
              <p className="text-xs text-slate-600">
                Capture today’s reflections, thoughts, and media
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-300/40 text-rose-900 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Story Title & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunset Walk Along the Ridge"
                className="w-full px-4 py-2.5 rounded-2xl crystal-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                disabled={isUploading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-indigo-600" />
                <span>Memory Date</span>
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl crystal-input text-sm text-slate-900 font-medium"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Story Content / Multi-line Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Story Note
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, feelings, details, and memories from today..."
              rows={5}
              className="w-full px-4 py-3 rounded-2xl crystal-input text-sm text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed font-normal"
              disabled={isUploading}
            />
          </div>

          {/* Media Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Attach Photos & Videos</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 shadow-sm transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Select Files</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Empty Media Dropzone or Staged Previews */}
            {stagedFiles.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/60 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer bg-white/20 hover:bg-white/35 transition-all duration-200 group"
              >
                <div className="flex justify-center gap-2 mb-2 text-indigo-500 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                  <Film className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to choose photos or videos to attach
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Saved permanently in high quality
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white/25 border border-white/50 max-h-48 overflow-y-auto">
                {stagedFiles.map((staged) => (
                  <div
                    key={staged.id}
                    className="relative group rounded-xl overflow-hidden aspect-square bg-white/30 border border-white/70 shadow-sm"
                  >
                    {staged.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={staged.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-white p-2">
                        <Film className="w-6 h-6 text-indigo-400 mb-1" />
                        <span className="text-[10px] text-slate-300 text-center line-clamp-1">
                          {staged.file.name}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeStagedFile(staged.id)}
                      disabled={isUploading}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  {currentFileUploading || "Saving..."}
                </span>
                <span className="font-bold text-indigo-600 font-mono">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Memory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save to Daily Flow</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
