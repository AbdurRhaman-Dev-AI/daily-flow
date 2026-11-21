"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { DiaryEntry } from "@/lib/types";

interface DeleteConfirmModalProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: DiaryEntry) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  entry,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !entry) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(entry);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md liquid-glass-modal rounded-3xl p-6 sm:p-7 shadow-liquid-lg animate-scale-up border border-white/80">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Delete This Memory?
            </h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Are you sure you want to delete <span className="font-semibold text-slate-800">“{entry.title}”</span>?
          {entry.media && entry.media.length > 0 && (
            <span> All {entry.media.length} associated photos and videos in your private storage will also be permanently removed.</span>
          )}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Keep Memory
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
