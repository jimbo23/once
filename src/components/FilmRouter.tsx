"use client";

import { useState, useEffect } from "react";
import { type FilmState, getFilmState } from "@/lib/film";
import { SealedFilm } from "./SealedFilm";
import { Camera } from "./Camera";
import { DevelopingFilm } from "./DevelopingFilm";
import { RevealedFilm } from "./RevealedFilm";

export function FilmRouter({ initialState }: { initialState: FilmState }) {
  const [state, setState] = useState<FilmState>(initialState);
  const [photoCount, setPhotoCount] = useState(0);
  const [photos, setPhotos] = useState<
    { id: string; url: string; guestName: string; capturedAt: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = getFilmState();
      if (current !== state) {
        setState(current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state === "developing") {
      fetch("/api/photos/count")
        .then((r) => r.json())
        .then((d) => setPhotoCount(d.total))
        .catch(() => {});
    }
    if (state === "revealed") {
      fetch("/api/photos")
        .then((r) => r.json())
        .then((d) => setPhotos(d.photos))
        .catch(() => {});
    }
  }, [state]);

  switch (state) {
    case "sealed":
      return <SealedFilm />;
    case "live":
      return <Camera />;
    case "developing":
      return <DevelopingFilm photoCount={photoCount} />;
    case "revealed":
      return <RevealedFilm photos={photos} />;
  }
}
