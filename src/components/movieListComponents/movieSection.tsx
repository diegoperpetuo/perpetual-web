import { useEffect, useState, useRef } from "react";
import { MovieDb, MovieResult, TvResult } from "moviedb-promise";
import MovieCard from "./movieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const moviedb = new MovieDb("73628ed5a3ca37355ba6d16fdb8b4a23");

type SectionType = "popular" | "now_playing" | "tv";

const MovieSection = ({ title, type }: { title: string; type: SectionType }) => {
  const [items, setItems] = useState<(MovieResult | TvResult)[]>([]);
  const [genresMap, setGenresMap] = useState<{ [key: number]: string }>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    const fetchData = async () => {
      let res;
      if (type === "popular") {
        res = await moviedb.moviePopular();
      } else if (type === "now_playing") {
        res = await moviedb.movieNowPlaying();
      } else {
        res = await moviedb.tvPopular();
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
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 no-scrollbar py-4"
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