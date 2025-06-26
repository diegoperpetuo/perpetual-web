import { Star, Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import tmdbService from "../services/tmdbService";

function HeroBanner() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<{ [key: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

  type Movie = {
    id: number;
    runtime: number;
    title: string;
    genre_ids: number[];
    overview: string;
    release_date: string;
    vote_average: number;
    backdrop_path: string;
  };

  const fetchGenres = async () => {
    try {
      const genresData = await tmdbService.getAllGenres();
      setGenres(genresData);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const trendingData = await tmdbService.getTrendingMovies();
      const data = trendingData.results || [];

      const today = new Date();
      const filtered = data
        .filter((movie: any) => new Date(movie.release_date) <= today)
        .slice(0, 5);

      const detailed = await Promise.all(
        filtered.map(async (movie: any) => {
          try {
            const details = await tmdbService.getMovieDetails(movie.id);
            return { ...movie, runtime: details.runtime };
          } catch (error) {
            console.error(`Erro ao buscar detalhes do filme ${movie.id}:`, error);
            return { ...movie, runtime: 0 };
          }
        })
      );

      setMovies(detailed);
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchMovies();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % movies.length),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length),
    trackMouse: true,
  });

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const currentMovie = movies[currentIndex];

  if (!currentMovie) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const genreNames = currentMovie.genre_ids
    .map((id) => genres[id])
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return (
    <div
      {...handlers}
      className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-2xl">
            <motion.h1
              key={`title-${currentMovie.id}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4"
            >
              {currentMovie.title}
            </motion.h1>

            <motion.div
              key={`info-${currentMovie.id}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 mb-2 sm:mb-4 text-sm sm:text-base"
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1" />
                <span>{currentMovie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span>
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              </div>
              {currentMovie.runtime > 0 && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  <span>{currentMovie.runtime} min</span>
                </div>
              )}
            </motion.div>

            {genreNames && (
              <motion.p
                key={`genres-${currentMovie.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 mb-2 sm:mb-4 text-sm sm:text-base"
              >
                {genreNames}
              </motion.p>
            )}

            <motion.p
              key={`overview-${currentMovie.id}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base"
            >
              {currentMovie.overview}
            </motion.p>

            <motion.button
              key={`button-${currentMovie.id}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() =>
                navigate(`/detalhes/movie/${currentMovie.id}`)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors text-sm sm:text-base"
            >
              <span>Ver Detalhes</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Controles de navegação */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 rounded-full transition-colors shadow-md active:scale-90 focus:outline-none focus:ring-2 focus:ring-white"
        style={{ minWidth: 0, minHeight: 0 }}
        aria-label="Filme anterior"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 rounded-full transition-colors shadow-md active:scale-90 focus:outline-none focus:ring-2 focus:ring-white"
        style={{ minWidth: 0, minHeight: 0 }}
        aria-label="Próximo filme"
      >
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicadores - só aparecem em sm: ou maior */}
      <div className="hidden sm:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir para filme ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;