"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Calendar as CalendarIcon,
  Film,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadMediaFile, updateDiaryEntry, fileToDataUrl } from "@/services/diaryService";
import { DiaryEntry, MediaItem } from "@/lib/types";

interface MemoryEditModalProps {
  entry: DiaryEntry;
  isOpen: boolean;
  onClose: () => void;
  onEntryUpdated: (updated: DiaryEntry) => void;
}

interface StagedNewFile {
  file: File;
  previewUrl: string;
  type: "image" | "video";
  id: string;
}

export const MemoryEditModal: React.FC<MemoryEditModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEntryUpdated,
}) => {
  const { user, isDemo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [entryDate, setEntryDate] = useState(entry.entryDate);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>(entry.media || []);
  const [stagedFiles, setStagedFiles] = useState<StagedNewFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newStaged: StagedNewFile[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
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

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, idx) => idx !== index));
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
      setError("You must be signed in to edit memories.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setUploadProgress(0);

    try {
      const newUploaded: MediaItem[] = [];

      if (stagedFiles.length > 0) {
        for (let i = 0; i < stagedFiles.length; i++) {
          const staged = stagedFiles[i];
          const mediaItem = await uploadMediaFile(
            user.uid,
            entry.id,
            staged.file,
            (progress) => {
              const totalFraction = (i + progress / 100) / stagedFiles.length;
              setUploadProgress(Math.round(totalFraction * 100));
            }
          );
          newUploaded.push(mediaItem);
        }
      }

      const combinedMedia = [...existingMedia, ...newUploaded];

      const updates: Partial<DiaryEntry> = {
        title: title.trim(),
        content: content.trim(),
        entryDate,
        media: combinedMedia,
      };

      await updateDiaryEntry(user.uid, entry.id, updates, isDemo);

      onEntryUpdated({
        ...entry,
        ...updates,
      });
      onClose();
    } catch (err: any) {
      console.error("Update memory error:", err);
      setError(err?.message || "Failed to update memory.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/30 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl crystal-glass-modal rounded-4xl p-6 sm:p-8 my-8 shadow-2xl animate-scale-up border border-white/80">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/40 mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Edit Memory
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl crystal-input text-sm text-slate-900 font-medium"
                disabled={isSaving}
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
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Story Note
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl crystal-input text-sm text-slate-900 resize-none leading-relaxed font-normal"
              disabled={isSaving}
            />
          </div>

          {/* Media Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Media ({existingMedia.length + stagedFiles.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 transition-colors shadow-sm"
              >
                <Upload className="w-3 h-3" />
                <span>Add More Media</span>
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

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white/25 border border-white/50 max-h-48 overflow-y-auto">
              {/* Existing Media */}
              {existingMedia.map((media, idx) => (
                <div
                  key={`exist-${idx}`}
                  className="relative group rounded-xl overflow-hidden aspect-square bg-white/30 border border-white/70 shadow-sm"
                >
                  {media.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={media.name || "Media"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
                      <Film className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(idx)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors"
                    title="Remove from entry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Newly Staged Files */}
              {stagedFiles.map((staged) => (
                <div
                  key={staged.id}
                  className="relative group rounded-xl overflow-hidden aspect-square bg-white/30 border-2 border-indigo-500/80 shadow-sm"
                >
                  {staged.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={staged.previewUrl}
                      alt="New file preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
                      <Film className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeStagedFile(staged.id)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {isSaving && stagedFiles.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-1.5 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Saving media...
                </span>
                <span className="font-bold text-indigo-600 font-mono">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all rounded-full"
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
              disabled={isSaving}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
