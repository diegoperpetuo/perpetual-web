import { useEffect, useState } from "react";
import { Star, Calendar, Clock } from "lucide-react";
import { useParams } from "react-router-dom";

interface Provider {
  provider_name: string;
  logo_path: string;
}

interface ProductionData {
  title?: string;
  name?: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average: number;
  genres: { name: string }[];
  production_countries?: { name: string }[];
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
  const { id, media_type } = useParams<{ id: string; media_type: string }>();
  const [movie, setMovie] = useState<ProductionData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [movieRes, providersRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/${media_type}/${id}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR&append_to_response=credits,videos`
          ),
          fetch(
            `https://api.themoviedb.org/3/${media_type}/${id}/watch/providers?api_key=12923231fddd461a9280cdc286a6bee5`
          ),
        ]);

        const movieData = await movieRes.json();
        const providersData = await providersRes.json();

        setMovie(movieData);
        setProviders(providersData.results?.BR?.flatrate || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, media_type]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">
          Carregando detalhes do {media_type === "tv" ? "programa" : "filme"}...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-xl">Não foi possível carregar os detalhes.</div>
      </div>
    );
  }

  const trailerKey = movie.videos?.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  )?.key;

  const releaseDate = movie.release_date || movie.first_air_date;
  const runtime = movie.runtime || movie.episode_run_time?.[0];
  const title = movie.title || movie.name || "Sem título";

  return (
    <div className="bg-neutral-900 text-white min-h-screen px-4 sm:px-6 py-8 sm:py-10">
      {trailerKey && (
        <div className="w-full mb-8 sm:mb-10 aspect-video max-w-4xl mx-auto">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title={`Trailer de ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
        <div className="flex justify-center md:block">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={title}
            className="rounded-lg w-full max-w-[300px] md:w-[300px] shadow-lg"
          />
        </div>

        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {title.toUpperCase()}
            </h1>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto">
              + Adicionar aos favoritos
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {movie.genres.map((genre, index) => (
              <span
                key={index}
                className="bg-white text-black px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
              >
                {genre.name}
              </span>
            ))}

            {releaseDate && (
              <span className="flex items-center gap-1 text-sm text-zinc-300 ml-2 sm:ml-4">
                <Calendar /> {new Date(releaseDate).getFullYear()}
              </span>
            )}

            {runtime && (
              <span className="flex items-center gap-1 text-sm text-zinc-300">
                <Clock /> {runtime} min
              </span>
            )}

            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <Star /> {movie.vote_average.toFixed(1)}
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
            {movie.overview || "Sinopse não disponível."}
          </p>

          <div className="space-y-2 text-sm text-zinc-300">
            <p>
              <strong className="text-white">País:</strong>{" "}
              {movie.production_countries
                ? movie.production_countries.map((c) => c.name).join(", ")
                : "Não disponível"}
            </p>
            <p>
              <strong className="text-white">Gêneros:</strong>{" "}
              {movie.genres.map((g) => g.name).join(", ")}
            </p>

            {releaseDate && (
              <p>
                <strong className="text-white">Data de lançamento:</strong>{" "}
                {new Date(releaseDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            {movie.production_companies.length > 0 && (
              <p>
                <strong className="text-white">Produção:</strong>{" "}
                {movie.production_companies
                  .slice(0, 3)
                  .map((p) => p.name)
                  .join(", ")}
              </p>
            )}

            {movie.credits.cast.length > 0 && (
              <p>
                <strong className="text-white">Elenco principal:</strong>{" "}
                {movie.credits.cast
                  .slice(0, 5)
                  .map((a) => a.name)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {providers.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
            Onde assistir
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.provider_name}
                className="flex items-center gap-3 bg-neutral-800 p-3 rounded-lg"
              >
                <img
                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <span className="text-sm sm:text-base font-medium">
                  {provider.provider_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailsPage;
