import { useEffect, useState } from "react";
import { Star, Calendar, Clock} from "lucide-react";
import { useParams } from "react-router-dom";

interface Provider {
  provider_name: string;
  logo_path: string;
}

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

function DetailsPage() {

  const { id, mediaType } = useParams<{ id: string; mediaType: string }>();

  const [movie, setMovie] = useState<MovieData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR&append_to_response=credits,videos`
    )
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  
    fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=12923231fddd461a9280cdc286a6bee5`
    )
      .then((res) => res.json())
      .then((data) => {
        const brProviders = data.results?.BR?.flatrate || [];
        setProviders(brProviders);
      })
      .catch((err) => console.error("Erro ao buscar provedores:", err));
  }, [id, mediaType]);
  

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Carregando detalhes do filme...</div>
      </div>
    );
  }
  

  return (
    <div className="bg-neutral-900 text-white min-h-screen px-6 py-10">
      {movie.videos?.results?.length > 0 && (
        <div className="w-full mb-10 aspect-video max-w-4xl mx-auto">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${
              movie.videos.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
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
              <Calendar />{" "}
              {new Date(movie.release_date).getFullYear()}
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <Clock /> {movie.runtime} min
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <Star /> {movie.vote_average}
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed">{movie.overview}</p>

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
              {movie.credits.cast.slice(0, 5).map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>
      </div>

      {providers.length > 0 && (
        <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Onde assistir</h2>
            <div className="space-y-4">
            {providers.map((provider) => (
                <div
                key={provider.provider_name}
                className="flex items-center gap-4"
                >
                <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-10 h-10 object-contain"
                />
                <span className="text-lg font-medium">{provider.provider_name}</span>
                </div>
            ))}
            </div>
        </div>
     )}

    </div>
  );
}

export default DetailsPage;
