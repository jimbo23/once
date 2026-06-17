"use client";

import { useCountdown } from "@/lib/hooks";
import { FILM_CONFIG } from "@/lib/film";
import { motion } from "motion/react";

export function DevelopingFilm({ photoCount }: { photoCount: number }) {
  const countdown = useCountdown(FILM_CONFIG.revealDate);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Darkroom red ambience */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, oklch(0.45 0.22 25) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.04] blur-3xl"
        style={{ background: "oklch(0.5 0.2 30)" }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="text-center max-w-sm w-full relative z-10"
      >
        {/* Developing tank */}
        <div className="mb-12 relative inline-block">
          <motion.div
            className="w-44 h-44 relative"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Tank body */}
            <div className="absolute inset-0 rounded-3xl bg-film-dark border-2 border-film-brown/50 overflow-hidden shadow-[0_0_80px_oklch(0.5_0.2_25_/_0.1)]">
              {/* Chemical wash */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.45 0.18 25 / 0.12) 0%, oklch(0.75 0.14 70 / 0.08) 50%, oklch(0.45 0.18 25 / 0.12) 100%)",
                }}
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse",
                }}
              />
              {/* Developing photos */}
              <div className="absolute inset-4 flex flex-wrap gap-1.5 items-center justify-center">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-8 rounded-sm bg-film-cream/10 border border-film-cream/5"
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
              {/* Horizontal scan lines */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0.92 0.04 85 / 0.3) 2px, transparent 3px)",
                }}
              />
            </div>
            {/* Tank lid */}
            <div className="absolute -top-3 left-1/4 right-1/4 h-5 rounded-t-xl bg-film-brown/80 border-2 border-film-brown shadow-md" />
            {/* Tank spindle */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-film-dark border-2 border-film-brown">
              <motion.div
                className="absolute inset-1 rounded-full border border-film-cream/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-film-cream/10" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.h1
          className="font-display text-5xl md:text-6xl text-film-cream mb-3"
          style={{ textShadow: "0 0 40px oklch(0.5 0.18 25 / 0.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Developing...
        </motion.h1>
        <motion.p
          className="text-film-cream/40 text-sm mb-10 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-film-amber font-mono">{photoCount}</span>{" "}
          moments captured. The film is in the darkroom.
        </motion.p>

        {/* Countdown to reveal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-film-black/70 rounded-2xl border border-film-red/20 p-5 mb-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, oklch(0.55 0.18 25 / 0.5) 3px, transparent 4px)",
            }}
          />
          <p className="text-film-red/70 text-xs mb-3 font-mono uppercase tracking-wider relative">
            Reveals in
          </p>
          <div className="grid grid-cols-4 gap-1 relative">
            {[
              { value: countdown.days, label: "days" },
              { value: countdown.hours, label: "hrs" },
              { value: countdown.minutes, label: "min" },
              { value: countdown.seconds, label: "sec" },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="font-mono text-4xl md:text-5xl text-film-red tabular-nums leading-none">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-film-cream/25 mt-2">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-film-cream/25 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Come back January 3rd, 10am
        </motion.p>
      </motion.div>

      {/* Film perforations */}
      <div className="fixed bottom-0 left-0 right-0 h-7 bg-film-dark/90 border-t border-film-brown/25 flex items-center justify-center gap-2.5 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-2.5 rounded-[1.5px] bg-film-black border border-film-brown/20 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
