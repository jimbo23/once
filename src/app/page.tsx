import { getFilmState } from "@/lib/film";
import { FilmRouter } from "@/components/FilmRouter";

export default function Home() {
  const initialState = getFilmState();

  return <FilmRouter initialState={initialState} />;
}
