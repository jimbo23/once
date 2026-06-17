"use client";

import { useState, useEffect, useCallback } from "react";

type HostData = {
  guestCount: number;
  photoCount: number;
  photos: {
    id: string;
    url: string;
    guest_name: string;
    captured_at: string;
  }[];
};

export default function HostPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/host?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setAuthed(true);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem("host-token");
    if (stored) setToken(stored);
    setSiteUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (authed) {
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [authed, fetchData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("host-token", token);
    await fetchData();
  }

  async function handleDelete(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/host?token=${encodeURIComponent(token)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photoId }),
    });
    fetchData();
  }

  async function handleDownloadAll() {
    if (!data) return;
    const urls = data.photos.map((p) => p.url);
    for (const url of urls) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 bg-film-black">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="font-display text-3xl text-film-cream text-center mb-6">
            Host Access
          </h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter host secret"
            className="w-full px-4 py-3 bg-film-dark border border-film-brown/40 rounded-xl text-film-cream placeholder:text-film-cream/30 focus:outline-none focus:border-film-amber/60 transition-colors text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-film-amber text-film-black font-medium rounded-xl hover:bg-film-gold transition-colors"
          >
            {loading ? "..." : "Enter darkroom"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-film-black px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-film-cream">Darkroom</h1>
            <p className="font-mono text-xs text-film-cream/40 mt-1">
              Host control panel
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={!data?.photos.length}
            className="px-4 py-2 bg-film-amber text-film-black rounded-lg text-sm font-medium hover:bg-film-gold transition-colors disabled:opacity-30"
          >
            Download all
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-film-dark/60 border border-film-brown/30 rounded-xl p-6 mb-8 flex flex-col items-center">
          <h2 className="text-film-cream/80 text-sm font-medium mb-4">
            Guest QR Code
          </h2>
          {siteUrl && (
            <div className="bg-film-black p-4 rounded-xl border border-film-brown/20 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr?url=${encodeURIComponent(siteUrl)}`}
                alt="QR code for guests"
                className="w-48 h-48"
              />
            </div>
          )}
          <p className="font-mono text-[11px] text-film-cream/30 text-center">
            {siteUrl}
          </p>
          <p className="text-film-cream/40 text-xs mt-2 text-center max-w-xs">
            Print this on table cards or display at the venue entrance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-film-dark/60 border border-film-brown/30 rounded-xl p-5">
            <div className="font-mono text-4xl text-film-gold">
              {data?.guestCount || 0}
            </div>
            <div className="text-xs text-film-cream/50 mt-1.5">
              Guests joined
            </div>
          </div>
          <div className="bg-film-dark/60 border border-film-brown/30 rounded-xl p-5">
            <div className="font-mono text-4xl text-film-gold">
              {data?.photoCount || 0}
            </div>
            <div className="text-xs text-film-cream/50 mt-1.5">
              Photos captured
            </div>
          </div>
        </div>

        {/* Photo management */}
        {data?.photos && data.photos.length > 0 && (
          <>
            <h2 className="text-film-cream/60 text-sm font-medium mb-4">
              Recent photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {data.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`By ${photo.guest_name}`}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-film-black/0 group-hover:bg-film-black/60 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="px-3 py-1.5 bg-film-red text-film-cream text-xs rounded-lg font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <span className="font-mono text-[9px] text-film-cream/70 bg-film-black/70 rounded px-1.5 py-0.5">
                      {photo.guest_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
