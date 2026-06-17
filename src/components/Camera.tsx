"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

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
    startCamera(facingMode);
    fetchCount();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
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

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        setLastCapture(URL.createObjectURL(blob));
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

      // Warm shift
      r = Math.min(255, r * 1.08 + 8);
      g = Math.min(255, g * 1.02 + 4);
      b = Math.max(0, b * 0.9 - 5);

      // Slight desaturation
      const avg = (r + g + b) / 3;
      r = r * 0.85 + avg * 0.15;
      g = g * 0.85 + avg * 0.15;
      b = b * 0.85 + avg * 0.15;

      // Fade blacks (lift shadows)
      r = r * 0.92 + 20;
      g = g * 0.92 + 15;
      b = b * 0.92 + 12;

      // Add subtle grain
      const grain = (Math.random() - 0.5) * 18;
      r += grain;
      g += grain;
      b += grain;

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);

    // Vignette
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

    // Light leak (top-left warm)
    const leak = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
    leak.addColorStop(0, "rgba(255, 140, 50, 0.08)");
    leak.addColorStop(1, "rgba(255, 140, 50, 0)");
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, w, h);
  }

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

        {/* Film frame overlay */}
        <div className="absolute inset-0 pointer-events-none border-[3px] border-film-cream/10 rounded-sm" />

        {/* Flash effect */}
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

        {/* Shot counter */}
        <div className="absolute top-4 right-4 bg-film-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-film-brown/30">
          <span className="font-mono text-xs text-film-amber">
            {totalCount}
          </span>
          <span className="font-mono text-xs text-film-cream/40">
            {" "}
            on the roll
          </span>
        </div>

        {/* Flip camera button */}
        <button
          onClick={flipCamera}
          className="absolute top-4 left-4 w-10 h-10 bg-film-black/70 backdrop-blur-sm rounded-full border border-film-brown/30 flex items-center justify-center"
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
      </div>

      {/* Controls */}
      <div className="bg-film-dark border-t border-film-brown/30 px-6 py-6 flex items-center justify-center">
        <motion.button
          onClick={capture}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 rounded-full bg-film-cream border-4 border-film-amber/80 relative flex items-center justify-center active:bg-film-gold transition-colors"
          aria-label="Take photo"
        >
          <div className="w-14 h-14 rounded-full border-2 border-film-brown/40" />
        </motion.button>
      </div>

      {/* My shots count */}
      <div className="bg-film-dark px-6 pb-4 text-center">
        <span className="font-mono text-[11px] text-film-cream/40">
          Your shots: {photoCount}
        </span>
      </div>
    </div>
  );
}
