import { useEffect, useState, useRef } from "react";
import MovieCard from "./movieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import tmdbService from "../../services/tmdbService";

type SectionType = "popular" | "now_playing" | "tv";

const MovieSection = ({ title, type }: { title: string; type: SectionType }) => {
  const [items, setItems] = useState<any[]>([]);
  const [genresMap, setGenresMap] = useState<{ [key: number]: string }>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await tmdbService.getAllGenres();
        setGenresMap(genres);
      } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        if (type === "popular") {
          res = await tmdbService.getPopularMovies();
        } else if (type === "now_playing") {
          res = await tmdbService.getNowPlayingMovies();
        } else {
          res = await tmdbService.getPopularTVShows();
        }
        
        const basicItems = res.results || [];
        
        // Para filmes, buscar detalhes completos incluindo runtime
        if (type !== "tv") {
          const detailedItems = await Promise.all(
            basicItems.slice(0, 10).map(async (item) => {
              try {
                const details = await tmdbService.getMovieDetails(item.id);
                return { ...item, runtime: details.runtime };
              } catch (error) {
                console.error(`Erro ao buscar detalhes do filme ${item.id}:`, error);
                return item;
              }
            })
          );
          setItems(detailedItems);
        } else {
          // Para séries, buscar detalhes completos incluindo número de temporadas
          const detailedItems = await Promise.all(
            basicItems.slice(0, 10).map(async (item) => {
              try {
                const details = await tmdbService.getTVShowDetails(item.id);
                return { ...item, number_of_seasons: details.number_of_seasons };
              } catch (error) {
                console.error(`Erro ao buscar detalhes da série ${item.id}:`, error);
                return item;
              }
            })
          );
          setItems(detailedItems);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setItems([]);
      }
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
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-3 sm:px-4 md:px-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex space-x-0.5 xs:space-x-1 sm:space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-1 xs:p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-md active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ minWidth: 0, minHeight: 0 }}
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 xs:p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-md active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ minWidth: 0, minHeight: 0 }}
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex space-x-2 sm:space-x-3 md:space-x-4 overflow-x-auto no-scrollbar scroll-smooth px-3 sm:px-4 md:px-6"
      >
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <MovieCard
              movie={item}
              showGenres={true}
              showHD={true}
              genresMap={genresMap}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSection;