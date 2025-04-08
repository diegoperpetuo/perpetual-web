import { div } from "framer-motion/client";
import { Star, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

function HeroBanner() {
  const [movies, setMovies] = useState<
    {
      id: number;
      runtime: number;
      title: string;
      genre_ids: number[];
      overview: string;
      release_date: string;
      vote_average: number;
      poster_path: string;
    }[]
  >([]);
  const [genres, setGenres] = useState<{ [key: number]: string }>({});

  const fetchGenres = () => {
    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5`
    )
      .then((response) => response.json())
      .then((data) => {
        const genreMap: { [key: number]: string } = {};
        data.genres.forEach((genre: { id: number; name: string }) => {
          genreMap[genre.id] = genre.name;
        });
        setGenres(genreMap);
      })
      .catch((error) => {
        console.error("Error fetching genres:", error);
      });
  };

  const fetchData = () => {
    fetch(
      `https://api.themoviedb.org/3/trending/movie/day?language=pt-BR&page=1&api_key=12923231fddd461a9280cdc286a6bee5`
    )
      .then((response) => response.json())
      .then((data) => {
        const today = new Date();
        const top5 = data["results"]
          .filter((movie: { release_date: string }) => {
            const releaseDate = new Date(movie.release_date);
            return releaseDate <= today;
          })
          .slice(0, 5);
        setMovies(top5);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchGenres();
    fetchData();
  }, []);

  return (
    <>
      {movies.map((movie) => (
        <div className="relative w-full h-screen mt-4" key={movie.id}>
          <img
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            alt={movie.title}
          />
          <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 text-white bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div>
              <h1 className="text-4xl font-bold">{movie.title}</h1>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-4 mt-2 font-bold">
                
                <div className="flex items-center gap-2">
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <Calendar color="#fff" />
                </div>
                <div className="flex items-center gap-2">
                  <span>{movie.vote_average.toFixed(1)}</span>
                  <Star color="#fff" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {movie.genre_ids.map((genreId) => (
                  <span
                    key={genreId}
                    className="bg-white text-black font-bold rounded-2xl p-2"
                  >
                    {genres[genreId]}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-[40vw]">
              <p className="mt-4 text-lg">{movie.overview}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default HeroBanner;
