"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type CameraMode = "ready" | "shooting" | "resting";

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("camera-opened")) {
      return "shooting";
    }
    return "ready";
  });
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionShotCount = useRef(0);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (sessionShotCount.current > 0) {
        setMode("resting");
      }
    }, 20000);
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      try {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions.");
      }
    },
    [stream]
  );

  useEffect(() => {
    if (mode === "ready") return;
    startCamera(facingMode);
    fetchCount();
    resetInactivityTimer();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCount() {
    const res = await fetch("/api/photos/count");
    if (res.ok) {
      const data = await res.json();
      setTotalCount(data.total);
    }
  }

  function flipCamera() {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  }

  function openCamera() {
    localStorage.setItem("camera-opened", "true");
    setMode("shooting");
    startCamera(facingMode);
    fetchCount();
    resetInactivityTimer();
  }

  function goToResting() {
    setMode("resting");
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function wakeCamera() {
    sessionShotCount.current = 0;
    setMode("shooting");
    startCamera(facingMode);
    resetInactivityTimer();
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    if (facingMode === "user") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    applyFilmFilter(ctx, canvas.width, canvas.height);

    setFlashing(true);
    setTimeout(() => setFlashing(false), 600);

    resetInactivityTimer();
    sessionShotCount.current += 1;

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setLastCapture(url);
        setCaptures((prev) => [url, ...prev].slice(0, 12));
        setPhotoCount((c) => c + 1);
        setTotalCount((c) => c + 1);

        const guestId = localStorage.getItem("guest-id") || "anonymous";
        const guestName = localStorage.getItem("guest-name") || "Guest";

        const formData = new FormData();
        formData.append("photo", blob, `${guestId}-${Date.now()}.jpg`);
        formData.append("guestId", guestId);
        formData.append("guestName", guestName);

        await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });
      },
      "image/jpeg",
      0.85
    );
  }

  function applyFilmFilter(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      r = Math.min(255, r * 1.08 + 8);
      g = Math.min(255, g * 1.02 + 4);
      b = Math.max(0, b * 0.9 - 5);

      const avg = (r + g + b) / 3;
      r = r * 0.85 + avg * 0.15;
      g = g * 0.85 + avg * 0.15;
      b = b * 0.85 + avg * 0.15;

      r = r * 0.92 + 20;
      g = g * 0.92 + 15;
      b = b * 0.92 + 12;

      const grain = (Math.random() - 0.5) * 18;
      r += grain;
      g += grain;
      b += grain;

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);

    const gradient = ctx.createRadialGradient(
      w / 2,
      h / 2,
      w * 0.3,
      w / 2,
      h / 2,
      w * 0.7
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const leak = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
    leak.addColorStop(0, "rgba(255, 140, 50, 0.08)");
    leak.addColorStop(1, "rgba(255, 140, 50, 0)");
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, w, h);
  }

  const MAX_PHOTOS = 20;
  const guestName = typeof window !== "undefined"
    ? localStorage.getItem("guest-name") || "Guest"
    : "Guest";

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-film-red text-lg mb-4">{error}</p>
          <button
            onClick={() => startCamera(facingMode)}
            className="px-6 py-3 bg-film-amber text-film-black rounded-xl font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-film-black flex flex-col">
      <AnimatePresence mode="wait">
        {mode === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1 items-center justify-center px-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-film-dark to-film-black" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 text-center"
            >
              <p className="text-film-cream/60 text-lg mb-3">
                Hey {guestName}
              </p>
              <h2 className="font-display text-4xl text-film-cream mb-4">
                Your camera is ready
              </h2>
              <p className="text-film-cream/40 text-sm mb-8 max-w-[260px] mx-auto leading-relaxed">
                You have {MAX_PHOTOS} shots for the night. Make them count.
              </p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={openCamera}
                className="px-8 py-4 bg-film-amber text-film-black font-semibold rounded-xl text-lg active:scale-[0.98] transition-transform"
              >
                Open camera
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {mode === "shooting" && (
          <motion.div
            key="shooting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            {/* Viewfinder */}
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute inset-0 pointer-events-none border-[3px] border-film-cream/10 rounded-sm" />

              {/* Flash */}
              <AnimatePresence>
                {flashing && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-film-flash z-50"
                  />
                )}
              </AnimatePresence>

              {/* Last capture thumbnail */}
              <AnimatePresence>
                {lastCapture && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute bottom-4 left-4 w-16 h-16 rounded-lg overflow-hidden film-frame"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lastCapture}
                      alt="Last shot"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top bar: name + shot counter */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                {/* Flip camera */}
                <button
                  onClick={flipCamera}
                  className="w-10 h-10 bg-film-black/70 backdrop-blur-sm rounded-full border border-film-brown/30 flex items-center justify-center"
                  aria-label="Flip camera"
                >
                  <svg
                    className="w-5 h-5 text-film-cream"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>

                {/* Shots remaining */}
                <div className="bg-film-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-film-brown/30">
                  <span className="font-mono text-xs text-film-amber">
                    {photoCount}
                  </span>
                  <span className="font-mono text-xs text-film-cream/40">
                    /{MAX_PHOTOS}
                  </span>
                </div>
              </div>

              {/* Done button */}
              {photoCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={goToResting}
                  className="absolute bottom-4 right-4 bg-film-black/70 backdrop-blur-sm rounded-full px-4 py-2 border border-film-brown/30"
                >
                  <span className="text-film-cream/70 text-xs font-medium">
                    Done
                  </span>
                </motion.button>
              )}
            </div>

            {/* Shutter */}
            <div className="bg-film-dark border-t border-film-brown/30 px-6 py-5 flex items-center justify-center relative">
              {photoCount >= MAX_PHOTOS ? (
                <div className="text-center">
                  <p className="text-film-amber text-sm font-medium mb-2">
                    Roll full
                  </p>
                  <p className="text-film-cream/40 text-xs">
                    You&apos;ve used all {MAX_PHOTOS} shots
                  </p>
                </div>
              ) : (
                <motion.button
                  onClick={capture}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 rounded-full bg-film-cream border-4 border-film-amber/80 relative flex items-center justify-center active:bg-film-gold transition-colors"
                  aria-label="Take photo"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-film-brown/40" />
                </motion.button>
              )}
            </div>

            {/* Guest name */}
            <div className="bg-film-dark px-6 pb-4 text-center">
              <span className="font-mono text-[11px] text-film-cream/40">
                {guestName}&apos;s roll
              </span>
            </div>
          </motion.div>
        )}

        {mode === "resting" && (
          <motion.div
            key="resting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col flex-1 items-center justify-center px-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-film-dark to-film-black" />

            <div className="relative z-10 text-center max-w-sm w-full">
              {/* Shot summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <p className="text-film-cream/50 text-sm mb-1">{guestName}</p>
                <div className="font-mono text-5xl text-film-amber mb-2">
                  {photoCount}/{MAX_PHOTOS}
                </div>
                <p className="text-film-cream/50 text-sm">
                  {photoCount === 1 ? "shot" : "shots"} taken
                </p>
              </motion.div>

              {/* Film strip of captures */}
              {captures.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mt-8 mb-10"
                >
                  <div className="flex gap-2 justify-center overflow-hidden">
                    {captures.slice(0, 5).map((src, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="w-14 h-14 rounded-md overflow-hidden border border-film-brown/30 flex-shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Shot ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Shoot more or roll full */}
              {photoCount >= MAX_PHOTOS ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-film-amber/10 border border-film-amber/30 rounded-xl px-5 py-4"
                >
                  <p className="text-film-amber text-sm font-medium">
                    Your roll is full
                  </p>
                  <p className="text-film-cream/40 text-xs mt-1">
                    All {MAX_PHOTOS} shots used. Nice work.
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  onClick={wakeCamera}
                  className="w-full py-4 bg-film-amber text-film-black font-semibold rounded-xl text-lg active:scale-[0.98] transition-transform"
                >
                  Shoot more
                </motion.button>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-film-cream/30 text-xs mt-4"
              >
                Photos develop Jan 3 at 10am
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
