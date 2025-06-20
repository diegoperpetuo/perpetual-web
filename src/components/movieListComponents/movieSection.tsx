import { useEffect, useState, useRef } from "react";
import { MovieDb, MovieResult, TvResult } from "moviedb-promise";
import MovieCard from "./movieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const moviedb = new MovieDb(TMDB_API_KEY);

type SectionType = "popular" | "now_playing" | "tv";

const MovieSection = ({ title, type }: { title: string; type: SectionType }) => {
  const [items, setItems] = useState<(MovieResult | TvResult)[]>([]);
  const [genresMap, setGenresMap] = useState<{ [key: number]: string }>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TMDB_API_KEY) {
        console.error("Chave da API TMDB não configurada para MovieSection (genres).");
        return;
    }
    const fetchGenres = async () => {
      let movieGenres = await moviedb.genreMovieList({ language: "pt-BR" });
      let tvGenres = await moviedb.genreTvList({ language: "pt-BR" });
      const map: { [key: number]: string } = {};
      movieGenres.genres?.forEach((g) => {
        if (g.id !== undefined && g.name) map[g.id] = g.name;
      });
      tvGenres.genres?.forEach((g) => {
        if (g.id !== undefined && g.name) map[g.id] = g.name;
      });
      setGenresMap(map);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!TMDB_API_KEY) {
        console.error("Chave da API TMDB não configurada para MovieSection (data).");
        setItems([]);
        return;
    }
    const fetchData = async () => {
      let res;
      if (type === "popular") {
        res = await moviedb.moviePopular({language: "pt-BR"});
      } else if (type === "now_playing") {
        res = await moviedb.movieNowPlaying({language: "pt-BR"});
      } else {
        res = await moviedb.tvPopular({language: "pt-BR"});
      }
      setItems(res.results || []);
    };
    fetchData();
  }, [type]);

  const scroll = (direction: "left" | "right") => {
    const container = carouselRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth / 1.2;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="my-8">
      <div className="flex justify-between items-center mb-3 px-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button className="text-sm text-white/70 hover:underline">View all →</button>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black"
        >
          <ChevronLeft size={24} />
        </button>
        <div
          className="flex gap-4 overflow-x-hidden overflow-y-hidden scrollbar-hide px-4 no-scrollbar py-4"
          ref={carouselRef}
        >
          {items.map((item) => (
            <MovieCard
              key={item.id}
              movie={item}
              showGenres={type === "popular" || type === "tv"}
              showHD={type === "now_playing"}
              genresMap={genresMap}
            />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default MovieSection;