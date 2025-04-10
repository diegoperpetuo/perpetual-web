import MovieSection from "./movieListComponents/movieSection";

export default function MovieList() {
  return (
    <div className="bg-zinc-900 min-h-screen py-6 overflow-x-hidden">
      <MovieSection title="Em alta" type="popular" />
      <MovieSection title="Lançamentos - Filmes" type="now_playing" />
      <MovieSection title="Séries populares" type="tv" />
    </div>
  );
}