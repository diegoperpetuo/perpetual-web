import { useEffect, useState } from "react";
import { Star, Calendar, Clock, Heart, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Provider {
  provider_name: string;
  logo_path: string;
}

interface ProductionData {
  id: number;
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

interface UserMovie {
  tmdbId: number;
  rating?: number | null;
  favorite?: boolean;
  _id?: string;
}

function DetailsPage() {
  const { id: tmdbIdParam, media_type } = useParams<{ id: string; media_type: string }>();
  const [movie, setMovie] = useState<ProductionData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]); //
  const [isLoading, setIsLoading] = useState(true); //
  const [isFavorite, setIsFavorite] = useState(false);
  const [userMovieList, setUserMovieList] = useState<UserMovie[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!tmdbIdParam || !media_type) return;
      setIsLoading(true);
      try {
        const [movieRes, providersRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/${media_type}/${tmdbIdParam}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR&append_to_response=credits,videos`
          ),
          fetch(
            `https://api.themoviedb.org/3/${media_type}/${tmdbIdParam}/watch/providers?api_key=12923231fddd461a9280cdc286a6bee5`
          ),
        ]);

        const movieData = await movieRes.json();
        const providersData = await providersRes.json();

        setMovie(movieData);
        setProviders(providersData.results?.BR?.flatrate || []); //
      } catch (err) {
        console.error("Erro ao buscar dados da produção:", err);
        setErrorMessage("Não foi possível carregar os detalhes da produção.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tmdbIdParam, media_type]);

  useEffect(() => {
    if (isAuthenticated && token && tmdbIdParam) {
      setFavoriteLoading(true);
      const fetchUserMovies = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/user/movies`, { //
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const movies: UserMovie[] = await response.json();
            setUserMovieList(movies);
            const currentMovieAsFavorite = movies.find(
              (m) => m.tmdbId === parseInt(tmdbIdParam) && m.favorite
            );
            setIsFavorite(!!currentMovieAsFavorite);
          } else {
            console.error("Erro ao buscar lista de filmes do usuário:", await response.text());
          }
        } catch (error) {
          console.error("Falha ao buscar lista de filmes do usuário:", error);
        } finally {
          setFavoriteLoading(false);
        }
      };
      fetchUserMovies();
    } else {
      setUserMovieList([]);
      setIsFavorite(false);
    }
  }, [isAuthenticated, token, tmdbIdParam]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!tmdbIdParam || !movie || !media_type) return;

    setFavoriteLoading(true);
    setErrorMessage('');
    const currentTmdbId = parseInt(tmdbIdParam);
    const newFavoriteStatus = !isFavorite;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: currentTmdbId,
          favorite: newFavoriteStatus,
          media_type: media_type,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(responseData.error || 'Erro ao atualizar favorito.');
        setFavoriteLoading(false);
        return;
      }
      
      setIsFavorite(newFavoriteStatus);
      // A resposta do backend é o filme específico que foi adicionado/atualizado
      // ou a lista inteira (conforme definido em `addOrUpdateMovie` no backend)
      // Assumindo que responseData seja o filme atualizado:
      const updatedMovieEntry = responseData as UserMovie; 

      setUserMovieList(prevList => {
        const existingIndex = prevList.findIndex(m => m.tmdbId === updatedMovieEntry.tmdbId);
        if (existingIndex > -1) {
          const newList = [...prevList];
          newList[existingIndex] = { ...newList[existingIndex], ...updatedMovieEntry };
          return newList;
        } else {
          return [...prevList, updatedMovieEntry];
        }
      });

    } catch (error) {
      console.error("Erro ao favoritar/desfavoritar:", error);
      setErrorMessage('Falha na comunicação com o servidor ao tentar favoritar.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">
          Carregando detalhes {media_type === "tv" ? "da série" : "do filme"}...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-xl">{errorMessage || "Não foi possível carregar os detalhes."}</div>
      </div>
    );
  }

  const trailerKey = movie.videos?.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  )?.key; //

  const releaseDate = movie.release_date || movie.first_air_date;
  const runtime = movie.runtime || movie.episode_run_time?.[0];
  const title = movie.title || movie.name || "Sem título";

  return (
    <div className="bg-neutral-900 text-white min-h-screen px-4 sm:px-6 py-8 sm:py-10">
      {/* Seção do Trailer */}
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

      {/* Seção Principal de Detalhes */}
      <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
        {/* Poster */}
        <div className="flex justify-center md:block">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} //
            alt={title}
            className="rounded-lg w-full max-w-[300px] md:w-[300px] shadow-lg"
          />
        </div>

        {/* Informações */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {title.toUpperCase()}
            </h1>
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto flex items-center justify-center gap-2 transition-colors duration-150
                            ${isFavorite ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-600 hover:bg-red-700 text-white'}
                            disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isFavorite ? <XCircle size={20} /> : <Heart size={20} />}
                {favoriteLoading ? 'Aguarde...' : (isFavorite ? 'Remover dos Favoritos' : '+ Adicionar aos Favoritos')}
              </button>
            )}
             {!isAuthenticated && (
                 <button
                 onClick={() => navigate('/login')}
                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto flex items-center justify-center gap-2"
               >
                 <Heart size={20} /> Fazer Login para Favoritar
               </button>
            )}
          </div>
          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

          {/* Metadados: Gêneros, Ano, Duração, Rating */}
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
                <Calendar size={16} /> {new Date(releaseDate).getFullYear()}
              </span>
            )}
            {runtime && (
              <span className="flex items-center gap-1 text-sm text-zinc-300">
                <Clock size={16} /> {runtime} min
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-zinc-300">
              <Star size={16} /> {movie.vote_average.toFixed(1)}
            </span>
          </div>

          {/* Sinopse */}
          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
            {movie.overview || "Sinopse não disponível."}
          </p>

          {/* Detalhes Adicionais: País, Gêneros (repetido para layout?), Lançamento, Produção, Elenco */}
          <div className="space-y-2 text-sm text-zinc-300">
            <p>
              <strong className="text-white">País:</strong>{" "}
              {movie.production_countries && movie.production_countries.length > 0
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
            {movie.production_companies && movie.production_companies.length > 0 && (
              <p>
                <strong className="text-white">Produção:</strong>{" "}
                {movie.production_companies
                  .slice(0, 3)
                  .map((p) => p.name)
                  .join(", ")}
              </p>
            )}
            {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
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

      {/* Seção Onde Assistir */}
      {providers && providers.length > 0 && (
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