export const FILM_CONFIG = {
  eventDate: new Date("2027-01-02T10:00:00+08:00"),
  eventEndDate: new Date("2027-01-03T00:00:00+08:00"),
  revealDate: new Date("2027-01-03T10:00:00+08:00"),
  coupleName: "Kiefer & Partner",
  filmName: "Once",
  maxGuests: 200,
} as const;

export type FilmState = "sealed" | "live" | "developing" | "revealed";

export function getFilmState(): FilmState {
  const now = new Date();
  if (now < FILM_CONFIG.eventDate) return "sealed";
  if (now < FILM_CONFIG.eventEndDate) return "live";
  if (now < FILM_CONFIG.revealDate) return "developing";
  return "revealed";
}

export function getTimeUntil(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, target.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { days, hours, minutes, seconds, total };
}
