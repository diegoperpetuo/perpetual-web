import { Clock, PlayCircle, Star } from "lucide-react";
import { MovieResult, TvResult } from "moviedb-promise";
import { useNavigate } from "react-router-dom";

interface MovieCardProps {
  movie: MovieResult | TvResult;
  showGenres?: boolean;
  showHD?: boolean;
  genresMap?: { [key: number]: string };
}

const MovieCard = ({ movie, showGenres, showHD, genresMap }: MovieCardProps) => {
  const displayTitle = (movie as MovieResult).title || (movie as TvResult).name;

  const mediaType = (movie as MovieResult).title ? "movie" : "tv";
  const navigate = useNavigate();

  return (
    <div 
    onClick={() => navigate(`/detalhes/${mediaType}/${movie.id}`)}
    className="relative w-40 sm:w-48 text-white flex-shrink-0 transition-transform transform hover:scale-105">
      <div className="overflow-hidden rounded-xl">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`}
          alt={displayTitle}
          className="w-full h-64 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent rounded-b-xl pointer-events-none">
        <h3 className="text-sm font-semibold truncate">{displayTitle}</h3>
        <div className="flex flex-wrap items-center gap-1 text-xs mt-1">
          {showHD && <span className="bg-red-600 px-1 rounded">HD</span>}
          <Clock size={12} />
          <span>3:12:00</span>
          {showGenres && genresMap &&
            movie.genre_ids?.slice(0, 2).map((id) => (
              <span
                key={id}
                className="bg-red-600 px-1 py-0.5 rounded-full text-[11px]"
              >
                {genresMap[id] || "Gênero"}
              </span>
            ))}
        </div>
      </div>
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-xs rounded-full flex items-center gap-1">
        <Clock size={12} /> <span>3:12:00</span>
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-xs rounded-full flex items-center gap-1">
        <Star size={12} className="text-yellow-400" />
        <span>{movie.vote_average?.toFixed(1)}</span>
      </div>
      {showGenres && (
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <PlayCircle size={40} className="text-white/80 hover:text-white transition-colors" />
        </div>
      )}
    </div>
  );
};

export default MovieCard;