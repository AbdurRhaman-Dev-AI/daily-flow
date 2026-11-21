"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import { MediaItem } from "@/lib/types";

interface MediaLightboxProps {
  mediaList: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  mediaList,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Filter only images for lightbox navigation
  const imageMedia = mediaList.filter((m) => m.type === "image");
  const currentItem = imageMedia[currentIndex] || mediaList[initialIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageMedia.length - 1));
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < imageMedia.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageMedia.length, onClose]);

  if (!currentItem) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev < imageMedia.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageMedia.length - 1));
    setIsZoomed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="px-4 py-2 rounded-2xl liquid-glass text-slate-800 text-xs font-medium">
          {imageMedia.length > 1 ? (
            <span>
              Image {currentIndex + 1} of {imageMedia.length}
            </span>
          ) : (
            <span>Photo Preview</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2.5 rounded-2xl liquid-glass text-slate-700 hover:text-indigo-600 transition-colors shadow-sm"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          <a
            href={currentItem.url}
            target="_blank"
            rel="noopener noreferrer"
            download={currentItem.name || "memory-photo.jpg"}
            className="p-2.5 rounded-2xl liquid-glass text-slate-700 hover:text-indigo-600 transition-colors shadow-sm"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl liquid-glass text-slate-700 hover:text-rose-600 transition-colors shadow-sm"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center p-4 cursor-pointer"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentItem.url}
          alt={currentItem.name || "Story memory photo"}
          className={`max-h-[80vh] max-w-full rounded-2xl shadow-2xl transition-all duration-300 object-contain ${
            isZoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"
          }`}
        />
      </div>

      {/* Navigation Arrows */}
      {imageMedia.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full liquid-glass text-slate-700 hover:text-indigo-600 transition-all hover:scale-110 shadow-lg"
            title="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full liquid-glass text-slate-700 hover:text-indigo-600 transition-all hover:scale-110 shadow-lg"
            title="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Media Caption / Filename at Bottom */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full liquid-glass text-slate-600 text-xs text-center max-w-md truncate">
        {currentItem.name || "Daily Flow Memory"}
      </div>
    </div>
  );
};
