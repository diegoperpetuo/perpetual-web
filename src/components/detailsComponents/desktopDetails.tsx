import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { BsFillCalendarDateFill } from "react-icons/bs";

interface MovieData {
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: { name: string }[];
  production_countries: { name: string }[];
  production_companies: { name: string }[];
  poster_path: string;
  credits: {
    cast: { name: string; character: string }[];
  };
  videos: {
    results: {
      key: string;
      site: string;
      type: string;
      name: string;
    }[];
  };
}

function Details() {
  const [movie, setMovie] = useState<MovieData | null>(null);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${157336}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR&append_to_response=credits,videos`
    )
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  }, []);

  if (!movie) return <div className="text-white">Carregando...</div>;

  return (
    <div className="bg-neutral-900 text-white min-h-screen px-6 py-10">
        {movie.videos?.results?.length > 0 && (
        <div className="w-full mb-10 aspect-video max-w-4xl mx-auto">
            <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${
                movie.videos.results.find(
                (video) =>
                    video.type === "Trailer" && video.site === "YouTube"
                )?.key
            }`}
            title="Trailer do filme"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            ></iframe>
        </div>
        )}
      <div className="flex flex-col md:flex-row gap-10">
        <div>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg w-full md:w-[300px] shadow-lg"
          />
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{movie.title.toUpperCase()}</h1>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
              + Adicionar aos favoritos
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {movie.genres.map((genre, index) => (
              <span
                key={index}
                className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium"
              >
                {genre.name}
              </span>
            ))}
            <span className="flex items-center gap-1 text-sm text-zinc-300 ml-4">
              <BsFillCalendarDateFill />{" "}
              {new Date(movie.release_date).getFullYear()}
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <FiClock /> {movie.runtime} min
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <FaStar/> {movie.vote_average}
            </span>
          </div>

          {/* Sinopse */}
          <p className="text-zinc-300 leading-relaxed">{movie.overview}</p>

          {/* Infos técnicas */}
          <div className="space-y-2 text-sm text-zinc-300">
            <p>
              <strong className="text-white">Country:</strong>{" "}
              {movie.production_countries.map((c) => c.name).join(", ")}
            </p>
            <p>
              <strong className="text-white">Genre:</strong>{" "}
              {movie.genres.map((g) => g.name).join(", ")}
            </p>
            <p>
              <strong className="text-white">Date Release:</strong>{" "}
              {new Date(movie.release_date).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>
              <strong className="text-white">Production:</strong>{" "}
              {movie.production_companies.map((p) => p.name).join(", ")}
            </p>
            <p>
              <strong className="text-white">Cast:</strong>{" "}
              {movie.credits.cast
                .slice(0, 5)
                .map((a) => a.name)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;