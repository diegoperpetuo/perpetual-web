import { Star, Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

function HeroBanner() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<{ [key: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

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
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5`
      );
      const data = await res.json();
      const genreMap: { [key: number]: string } = {};
      data.genres.forEach((g: { id: number; name: string }) => {
        genreMap[g.id] = g.name;
      });
      setGenres(genreMap);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5`
      );
      const data = await res.json();

      const today = new Date();
      const filtered = data.results
        .filter((movie: any) => new Date(movie.release_date) <= today)
        .slice(0, 5);

      const detailed = await Promise.all(
        filtered.map(async (movie: any) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5`
          );
          const details = await res.json();
          return { ...movie, runtime: details.runtime };
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((i) => (i + 1) % movies.length),
    onSwipedRight: () =>
      setCurrentIndex((i) => (i === 0 ? movies.length - 1 : i - 1)),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % movies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((i) => (i === 0 ? movies.length - 1 : i - 1));
  };

  return (
    <div className="relative touch-none " {...swipeHandlers}>
      <AnimatePresence mode="wait">
        {movies.length > 0 && (
          <motion.div
            key={movies[currentIndex].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-screen"
          >
            <img
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={`https://image.tmdb.org/t/p/original${movies[currentIndex].backdrop_path}`}
              alt={`Poster do filme ${movies[currentIndex].title}`}
            />

            <div className="absolute inset-0 flex flex-col justify-center lg:justify-end items-center lg:items-start px-4 lg:px-8 py-6 text-white text-center lg:text-left mb-16 h-full">
              <div className="flex flex-col items-center lg:items-start">
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {movies[currentIndex].title}
                </h1>

                <div className="flex flex-row items-center gap-2 lg:gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar color="#fff" />
                    <span>
                      {new Date(
                        movies[currentIndex].release_date
                      ).getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star color="#fff" />
                    <span>{movies[currentIndex].vote_average.toFixed(1)}</span>
                  </div>
                  {movies[currentIndex].runtime > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock color="#fff" />
                      <span>{movies[currentIndex].runtime} min</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                  {movies[currentIndex].genre_ids.map((id) => (
                    <span
                      key={id}
                      className="bg-white text-black font-bold rounded-2xl px-4 py-1"
                    >
                      {genres[id]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-20 lg:mt-6 w-full flex justify-center lg:justify-start">
                <p
                  className="bg-black/60 p-4 rounded-xl shadow-lg max-w-[650px] text-base leading-relaxed max-h-[100px] overflow-auto"
                  style={{
                    scrollbarWidth: "none",
                    scrollbarColor: "none",
                  }}
                >
                  {movies[currentIndex].overview}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full hover:bg-red-500 hover:scale-110 shadow-lg transition-transform duration-300"
      >
        <ArrowLeft color="#000" size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full hover:bg-red-500 hover:scale-110 shadow-lg transition-transform duration-300"
      >
        <ArrowRight color="#000" size={24} />
      </button>

      <div className="absolute bottom-1 w-full flex justify-center">
  {movies.map((_, i) => (
    <div
      key={i}
      className={`transition-all w-3 h-3 rounded-full mx-1 ${
        currentIndex === i ? "bg-white p-2" : "bg-red-500"
      }`}
    />
  ))}
</div>

    </div>
  );
}

export default HeroBanner;
