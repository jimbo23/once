"use client";

import { useCountdown } from "@/lib/hooks";
import { FILM_CONFIG } from "@/lib/film";
import { motion } from "motion/react";
import { useState } from "react";

export function SealedFilm({ onJoined }: { onJoined: () => void }) {
  const countdown = useCountdown(FILM_CONFIG.revealDate);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("guest-id", data.id);
        localStorage.setItem("guest-name", name.trim());
        onJoined();
      } else {
        setError("Couldn't join. Try again.");
      }
    } catch {
      setError("No connection. Check your signal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient light leak — top right warm flare */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "oklch(0.6 0.2 40)" }}
      />
      {/* Bottom left cooler flare */}
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "oklch(0.5 0.12 55)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm w-full relative z-10"
      >
        {/* Film canister */}
        <motion.div
          className="mb-10 relative inline-block"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-36 h-36 rounded-full bg-film-dark border-[5px] border-film-brown relative overflow-hidden shadow-[0_0_60px_oklch(0.75_0.14_70_/_0.15)]">
            <div className="absolute inset-5 rounded-full bg-film-black border-2 border-film-brown/80" />
            <div className="absolute inset-10 rounded-full bg-film-dark border border-film-brown/40" />
            <div className="absolute inset-[52px] rounded-full bg-film-amber/20" />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, oklch(0.75 0.14 70 / 0.2) 15%, transparent 30%, transparent 50%, oklch(0.55 0.18 25 / 0.1) 65%, transparent 80%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display text-7xl md:text-8xl text-film-cream mb-2"
          style={{ textShadow: "0 0 60px oklch(0.75 0.14 70 / 0.3)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Once
        </motion.h1>
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-film-amber/80 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A film for one night
        </motion.p>

        {/* Added personal text */}
        <motion.p
          className="text-film-cream/50 text-sm mb-10 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          im kiefer
        </motion.p>

        {/* Countdown to reveal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-film-black/70 rounded-2xl border border-film-brown/40 p-5 mb-10 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, oklch(0.92 0.04 85 / 0.5) 3px, transparent 4px)",
            }}
          />
          <p className="text-film-cream/50 text-xs mb-3 font-light tracking-wide uppercase relative">
            Photos reveal in
          </p>
          <div className="grid grid-cols-4 gap-1 relative">
            {[
              { value: countdown.days, label: "days" },
              { value: countdown.hours, label: "hrs" },
              { value: countdown.minutes, label: "min" },
              { value: countdown.seconds, label: "sec" },
            ].map((unit, i) => (
              <motion.div
                key={unit.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className="font-mono text-4xl md:text-5xl text-film-gold pulse-warm tabular-nums leading-none">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-film-cream/30 mt-2">
                  {unit.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join form */}
        <motion.form
          onSubmit={handleJoin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <p className="text-film-cream/50 text-sm mb-4 font-light">
            Enter your name to start shooting
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            className="w-full px-5 py-3.5 bg-film-dark/80 border border-film-brown/50 rounded-xl text-film-cream placeholder:text-film-cream/25 focus:outline-none focus:border-film-amber/70 focus:shadow-[0_0_20px_oklch(0.75_0.14_70_/_0.1)] transition-all text-center text-lg"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-3.5 bg-film-amber text-film-black font-semibold rounded-xl transition-all hover:bg-film-gold hover:shadow-[0_0_30px_oklch(0.82_0.12_80_/_0.3)] disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? "Joining..." : "Start shooting"}
          </button>
          {error && (
            <p className="text-red-400/80 text-sm mt-2">{error}</p>
          )}
        </motion.form>
      </motion.div>

      {/* Film perforations — bottom */}
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
