"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Photo = {
  id: string;
  url: string;
  guestName: string;
  capturedAt: string;
};

export function RevealedFilm({ photos }: { photos: Photo[] }) {
  const [view, setView] = useState<"strip" | "grid">("strip");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-6xl text-film-cream/20 mb-6">
            ∅
          </div>
          <h1 className="font-display text-4xl text-film-cream mb-4">
            Empty roll
          </h1>
          <p className="text-film-cream/40 text-sm font-light">
            The film came back blank. That&apos;s never happened before.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-film-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-film-black/95 backdrop-blur-md border-b border-film-brown/15 px-5 py-4 flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl text-film-cream leading-none">
            Once
          </h1>
          <p className="font-mono text-[10px] text-film-amber/60 uppercase tracking-[0.2em] mt-1">
            {photos.length} moments developed
          </p>
        </div>
        <div className="flex gap-0.5 bg-film-dark/80 rounded-lg p-0.5 border border-film-brown/30">
          <button
            onClick={() => setView("strip")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "strip"
                ? "bg-film-amber text-film-black shadow-sm"
                : "text-film-cream/50 hover:text-film-cream/80"
            }`}
          >
            Film
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "grid"
                ? "bg-film-amber text-film-black shadow-sm"
                : "text-film-cream/50 hover:text-film-cream/80"
            }`}
          >
            Grid
          </button>
        </div>
      </motion.div>

      {view === "strip" ? (
        <FilmStrip photos={photos} onSelect={setSelectedPhoto} />
      ) : (
        <PhotoGrid photos={photos} onSelect={setSelectedPhoto} />
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}

function FilmStrip({
  photos,
  onSelect,
}: {
  photos: Photo[];
  onSelect: (p: Photo) => void;
}) {
  return (
    <div className="relative">
      {/* Sprocket holes left */}
      <div className="fixed left-0 top-0 bottom-0 w-5 bg-film-dark/90 z-30 flex flex-col items-center justify-start pt-20 gap-[55px] overflow-hidden border-r border-film-brown/10">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 rounded-[1.5px] bg-film-black border border-film-brown/25 flex-shrink-0"
          />
        ))}
      </div>

      {/* Sprocket holes right */}
      <div className="fixed right-0 top-0 bottom-0 w-5 bg-film-dark/90 z-30 flex flex-col items-center justify-start pt-20 gap-[55px] overflow-hidden border-l border-film-brown/10">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 rounded-[1.5px] bg-film-black border border-film-brown/25 flex-shrink-0"
          />
        ))}
      </div>

      {/* Film frames */}
      <div className="px-9 py-6 space-y-5">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, filter: "blur(16px) saturate(0)" }}
            animate={{ opacity: 1, filter: "blur(0px) saturate(1)" }}
            transition={{
              duration: 2.5,
              delay: i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => onSelect(photo)}
          >
            <div className="rounded-sm overflow-hidden border-[3px] border-film-cream/80 shadow-[0_4px_30px_oklch(0_0_0_/_0.5),inset_0_0_40px_oklch(0.13_0.01_60_/_0.3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo by ${photo.guestName}`}
                className="w-full aspect-[3/2] object-cover"
                loading="lazy"
              />
            </div>
            {/* Frame metadata */}
            <div className="flex items-center justify-between mt-2 px-0.5">
              <span className="font-mono text-[10px] text-film-orange/70 tabular-nums">
                {String(i + 1).padStart(2, "0")}A
              </span>
              <span className="text-[11px] text-film-cream/40 font-light">
                {photo.guestName}
              </span>
              <span className="font-mono text-[9px] text-film-cream/20">
                {new Date(photo.capturedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PhotoGrid({
  photos,
  onSelect,
}: {
  photos: Photo[];
  onSelect: (p: Photo) => void;
}) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 p-0.5">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02, duration: 0.5 }}
          className="relative group cursor-pointer"
          onClick={() => onSelect(photo)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={`Photo by ${photo.guestName}`}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-film-black/0 group-hover:bg-film-black/50 transition-all duration-200 flex items-end p-2 opacity-0 group-hover:opacity-100">
            <span className="font-mono text-[10px] text-film-cream/80">
              {photo.guestName}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-film-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`Photo by ${photo.guestName}`}
          className="w-full rounded-sm border-2 border-film-cream/60 shadow-[0_10px_60px_oklch(0_0_0_/_0.6)]"
        />
        <div className="flex items-center justify-between mt-4 px-1">
          <div>
            <span className="text-film-cream/80 text-sm">
              {photo.guestName}
            </span>
            <span className="text-film-cream/30 text-xs ml-3">
              {new Date(photo.capturedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <a
            href={photo.url}
            download
            className="px-4 py-2 bg-film-amber/90 text-film-black text-xs font-semibold rounded-lg hover:bg-film-gold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Download
          </a>
        </div>
      </motion.div>

      {/* Close hint */}
      <p className="absolute bottom-6 text-film-cream/20 text-xs">
        Tap anywhere to close
      </p>
    </motion.div>
  );
}
