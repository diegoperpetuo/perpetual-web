import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Star, Heart, Loader2, PlayCircle, ChevronLeft } from "lucide-react";
import Comments from "./comments";
import tmdbService, { MovieResponse, ShowResponse } from "../services/tmdbService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface UserMovie {
  tmdbId: number;
  rating?: number | null;
  favorite?: boolean;
  media_type: "movie" | "tv";
  _id?: string;
  error?: string;
}

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
  profile_path?: string;
};

type VideoResult = {
  key: string;
  site: string;
  type: string;
  official: boolean;
};

type TmdbDetail = (
  | Omit<MovieResponse, "media_type">
  | (Omit<ShowResponse, "media_type"> & { seasons?: any[] })
) & {
  credits?: {
    cast?: CastMember[];
    crew?: CrewMember[];
  };
  videos?: {
    results?: VideoResult[];
  };
  media_type: "movie" | "tv";
};

function DetailsPage() {
  const { media_type, id: tmdbIdFromParams } = useParams<{
    media_type: "movie" | "tv";
    id: string;
  }>();
  const mediaType = media_type;
  const tmdbIdParam = tmdbIdFromParams;

  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<TmdbDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [_userMovieList, setUserMovieList] = useState<UserMovie[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbIdParam || !mediaType) {
      setError("ID do filme/série ou tipo de mídia não fornecido.");
      setIsLoading(false);
      return;
    }
    if (mediaType !== "movie" && mediaType !== "tv") {
      setError("Tipo de mídia inválido.");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const appendToResponse = ["credits", "videos"];
        const responseData = await tmdbService.getItemDetails(
          mediaType,
          parseInt(tmdbIdParam),
          appendToResponse
        );

        if (responseData) {
          setDetails({ ...responseData, media_type: mediaType } as TmdbDetail);
        } else {
          throw new Error("Resposta da API TMDB vazia ou inválida.");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError(
          "Não foi possível carregar os detalhes. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [tmdbIdParam, mediaType]);

  useEffect(() => {
    if (isAuthenticated && token && tmdbIdParam && mediaType) {
      setFavoriteLoading(true);
      setRatingLoading(true);

      const fetchUserMovieStatus = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/user/movies`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const movies: UserMovie[] = await response.json();
            setUserMovieList(movies);
            const currentMovieStatus = movies.find(
              (m) =>
                m.tmdbId === parseInt(tmdbIdParam) && m.media_type === mediaType
            );
            if (currentMovieStatus) {
              setIsFavorite(!!currentMovieStatus.favorite);
              setCurrentRating(
                currentMovieStatus.rating !== undefined
                  ? currentMovieStatus.rating
                  : null
              );
            } else {
              setIsFavorite(false);
              setCurrentRating(null);
            }
          } else {
            console.error(
              "Erro ao buscar lista de filmes do usuário:",
              await response.text()
            );
            setIsFavorite(false);
            setCurrentRating(null);
          }
        } catch (err) {
          console.error("Falha ao buscar lista de filmes do usuário:", err);
          setIsFavorite(false);
          setCurrentRating(null);
        } finally {
          setFavoriteLoading(false);
          setRatingLoading(false);
        }
      };
      fetchUserMovieStatus();
    } else {
      setUserMovieList([]);
      setIsFavorite(false);
      setCurrentRating(null);
      setFavoriteLoading(false);
      setRatingLoading(false);
    }
  }, [isAuthenticated, token, tmdbIdParam, mediaType]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !token || !details || !details.id || !mediaType) {
      if (!isAuthenticated) navigate("/login");
      return;
    }
    setFavoriteLoading(true);
    setError(null);
    try {
      const newFavoriteStatus = !isFavorite;
      const backendResponse = await fetch(`${API_BASE_URL}/api/user/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: details.id,
          favorite: newFavoriteStatus,
          media_type: mediaType,
        }),
      });

      const responseData: UserMovie | { error: string } =
        await backendResponse.json();

      if (backendResponse.ok) {
        const updatedMovieEntry = responseData as UserMovie;
        setIsFavorite(newFavoriteStatus);
        setUserMovieList((prevList) => {
          const existingIndex = prevList.findIndex(
            (m) =>
              m.tmdbId === updatedMovieEntry.tmdbId &&
              m.media_type === updatedMovieEntry.media_type
          );
          if (existingIndex > -1) {
            const newList = [...prevList];
            newList[existingIndex] = {
              ...newList[existingIndex],
              ...updatedMovieEntry,
            };
            return newList;
          } else {
            return [...prevList, updatedMovieEntry];
          }
        });
      } else {
        const errorResponse = responseData as { error: string };
        console.error("Erro ao atualizar favorito:", errorResponse);
        setError(errorResponse.error || "Falha ao atualizar favorito");
      }
    } catch (err) {
      console.error("Falha ao atualizar favorito:", err);
      setError("Erro de conexão ao atualizar favorito.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!isAuthenticated || !token || !details || !details.id || !mediaType) {
      if (!isAuthenticated) navigate("/login");
      return;
    }

    const ratingToSubmit = newRating;

    setRatingLoading(true);
    setRatingFeedback(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: details.id,
          rating: ratingToSubmit,
          media_type: mediaType,
        }),
      });

      const responseData: UserMovie | { error: string } = await response.json();

      if (response.ok) {
        const updatedMovieEntry = responseData as UserMovie;
        setCurrentRating(ratingToSubmit);
        setUserMovieList((prevList) => {
          const existingIndex = prevList.findIndex(
            (m) =>
              m.tmdbId === updatedMovieEntry.tmdbId &&
              m.media_type === updatedMovieEntry.media_type
          );
          if (existingIndex > -1) {
            const newList = [...prevList];
            newList[existingIndex] = {
              ...newList[existingIndex],
              ...updatedMovieEntry,
            };
            return newList;
          } else {
            return [...prevList, updatedMovieEntry];
          }
        });
        setRatingFeedback("Nota atualizada!");
        setTimeout(() => setRatingFeedback(null), 2000);
      } else {
        const errorData = responseData as { error: string };
        console.error("Erro ao atualizar nota:", errorData);
        setRatingFeedback(`Erro: ${errorData.error || "Falha ao salvar nota"}`);
      }
    } catch (err) {
      console.error("Falha ao atualizar nota:", err);
      setRatingFeedback("Erro de conexão ao salvar nota.");
    } finally {
      setRatingLoading(false);
    }
  };

  const openTrailer = () => {
    const officialTrailer = details?.videos?.results?.find(
      (video) =>
        video.official &&
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    );
    const targetTrailer =
      officialTrailer ||
      details?.videos?.results?.find(
        (video) =>
          video.site === "YouTube" &&
          (video.type === "Trailer" || video.type === "Teaser")
      );

    if (targetTrailer) {
      setTrailerKey(targetTrailer.key);
      setShowTrailerModal(true);
    } else {
      alert("Nenhum trailer disponível para este título.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1E1A1A] pt-20">
        <Loader2 className="h-16 w-16 animate-spin text-red-500" />
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="text-center text-red-500 pt-28 text-xl bg-[#1E1A1A] min-h-screen">
        {error}
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center text-gray-400 pt-28 text-xl bg-[#1E1A1A] min-h-screen">
        Detalhes não encontrados.
      </div>
    );
  }

  const title =
    (details as MovieResponse).title || (details as ShowResponse).name;
  const releaseDate =
    (details as MovieResponse).release_date ||
    (details as ShowResponse).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const genres = details.genres?.map((g) => g.name).join(", ") || "N/A";
  const runtimeOrSeasons =
    details.media_type === "movie"
      ? `${(details as MovieResponse).runtime || "?"} min`
      : `${(details as ShowResponse).number_of_seasons || "?"} temporada(s)`;
  const ratingTMDB = details.vote_average
    ? details.vote_average.toFixed(1)
    : "N/A";

  const director =
    details.media_type === "movie"
      ? details.credits?.crew?.find((c) => c.job === "Director")?.name
      : undefined;
  const creators =
    details.media_type === "tv"
      ? (details as ShowResponse).created_by?.map((c) => c.name).join(", ")
      : undefined;
  const mainCast = details.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="bg-[#1E1A1A] text-white min-h-screen">
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={`https://image.tmdb.org/t/p/original${
            details.backdrop_path || details.poster_path
          }`}
          alt={title || "Poster"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A1A] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E1A1A] via-[#1E1A1A]/50 to-transparent md:w-3/4"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 md:top-6 left-4 md:left-6 z-20 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="absolute bottom-0 left-0 p-4 md:p-10 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-gray-300 mb-3 text-sm md:text-base">
            <span>{year}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{runtimeOrSeasons}</span>
            <span className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" /> {ratingTMDB}{" "}
              (TMDB)
            </span>
          </div>
          <p className="text-gray-300 text-xs md:text-sm mb-4 line-clamp-3 md:line-clamp-4">
            {details.overview || "Sinopse não disponível."}
          </p>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={openTrailer}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base"
            >
              <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Assistir Trailer</span>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base ${
                  isFavorite
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                {favoriteLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? "fill-current" : ""}`} />
                )}
                <span>{isFavorite ? "Favorito" : "Favoritar"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#2a2626] rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Sinopse</h2>
              <p className="text-gray-300 leading-relaxed">
                {details.overview || "Sinopse não disponível."}
              </p>
            </div>

            <div className="bg-[#2a2626] rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Elenco Principal</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {mainCast.map((actor) => (
                  <div key={actor.id} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-gray-700">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white">{actor.name}</p>
                    <p className="text-xs text-gray-400">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>

            <Comments
              tmdbId={details.id}
              mediaType={details.media_type}
              title={title || ""}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-[#2a2626] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Informações</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Gêneros:</span>
                  <p className="text-white">{genres}</p>
                </div>
                <div>
                  <span className="text-gray-400">Ano:</span>
                  <p className="text-white">{year}</p>
                </div>
                <div>
                  <span className="text-gray-400">Duração:</span>
                  <p className="text-white">{runtimeOrSeasons}</p>
                </div>
                {director && (
                  <div>
                    <span className="text-gray-400">Diretor:</span>
                    <p className="text-white">{director}</p>
                  </div>
                )}
                {creators && (
                  <div>
                    <span className="text-gray-400">Criado por:</span>
                    <p className="text-white">{creators}</p>
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <div className="bg-[#2a2626] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Sua Avaliação</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        disabled={ratingLoading}
                        className={`text-2xl transition-colors ${
                          currentRating && star <= currentRating
                            ? "text-yellow-400"
                            : "text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  {ratingFeedback && (
                    <p className={`text-sm ${
                      ratingFeedback.includes("Erro") ? "text-red-400" : "text-green-400"
                    }`}>
                      {ratingFeedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal do Trailer */}
      {showTrailerModal && trailerKey && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailsPage;