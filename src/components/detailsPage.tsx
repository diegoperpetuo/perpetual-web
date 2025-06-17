import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MovieDb, MovieResponse, ShowResponse } from "moviedb-promise";
import { useAuth } from "../contexts/AuthContext";
import { Star, Heart, Loader2, PlayCircle, ChevronLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; 
const moviedb = new MovieDb(TMDB_API_KEY);


interface UserMovie {
  tmdbId: number;
  rating?: number | null;
  favorite?: boolean;
  media_type: 'movie' | 'tv';
  _id?: string;
  error?: string; 
}

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

interface CrewMember {
  id: number;
  name: string;
  job?: string;
  profile_path?: string | null;
}

interface VideoResult {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

type TmdbDetail = (Omit<MovieResponse, 'media_type'> | Omit<ShowResponse, 'media_type'> & { seasons?: any[] }) & {
  credits?: {
    cast?: CastMember[];
    crew?: CrewMember[];
  };
  videos?: {
    results?: VideoResult[];
  };
  media_type: 'movie' | 'tv';
};

function DetailsPage() {
  const { media_type, id: tmdbIdFromParams } = useParams<{ media_type: 'movie' | 'tv'; id: string }>();
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
    if (mediaType !== 'movie' && mediaType !== 'tv') {
        setError("Tipo de mídia inválido.");
        setIsLoading(false);
        return;
    }
    if (!TMDB_API_KEY) {
        setError("Chave da API TMDB não configurada.");
        setIsLoading(false);
        return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let responseData: MovieResponse | ShowResponse | null = null;
        const appendToResponse = ['credits', 'videos'];
        
        if (mediaType === "movie") {
          responseData = await moviedb.movieInfo({ id: tmdbIdParam, language: "pt-BR", append_to_response: appendToResponse.join(',') });
        } else if (mediaType === "tv") {
          responseData = await moviedb.tvInfo({ id: tmdbIdParam, language: "pt-BR", append_to_response: appendToResponse.join(',') });
        }
        
        if (responseData) {
            setDetails({ ...responseData, media_type: mediaType } as TmdbDetail);
        } else {
            throw new Error("Resposta da API TMDB vazia ou inválida.");
        }

      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError("Não foi possível carregar os detalhes. Tente novamente mais tarde.");
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
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const movies: UserMovie[] = await response.json();
            setUserMovieList(movies);
            const currentMovieStatus = movies.find(
              (m) => m.tmdbId === parseInt(tmdbIdParam) && m.media_type === mediaType
            );
            if (currentMovieStatus) {
                setIsFavorite(!!currentMovieStatus.favorite);
                setCurrentRating(currentMovieStatus.rating !== undefined ? currentMovieStatus.rating : null);
            } else {
                setIsFavorite(false);
                setCurrentRating(null);
            }
          } else {
            console.error("Erro ao buscar lista de filmes do usuário:", await response.text());
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
        if(!isAuthenticated) navigate('/login');
        return;
    }
    setFavoriteLoading(true);
    setError(null); 
    try {
      const newFavoriteStatus = !isFavorite;
      const backendResponse = await fetch(`${API_BASE_URL}/api/user/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: details.id,
          favorite: newFavoriteStatus,
          media_type: mediaType 
        }),
      });
      
      const responseData: UserMovie | { error: string } = await backendResponse.json();

      if (backendResponse.ok) {
        const updatedMovieEntry = responseData as UserMovie;
        setIsFavorite(newFavoriteStatus);
        setUserMovieList(prevList => {
            const existingIndex = prevList.findIndex(m => m.tmdbId === updatedMovieEntry.tmdbId && m.media_type === updatedMovieEntry.media_type);
            if (existingIndex > -1) {
              const newList = [...prevList];
              newList[existingIndex] = { ...newList[existingIndex], ...updatedMovieEntry };
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
        if(!isAuthenticated) navigate('/login');
        return;
    }
    
    const ratingToSubmit = newRating; 
    
    setRatingLoading(true);
    setRatingFeedback(null);
    setError(null); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: details.id,
          rating: ratingToSubmit,
          media_type: mediaType 
        }),
      });
      
      const responseData: UserMovie | { error: string } = await response.json();

      if (response.ok) {
        const updatedMovieEntry = responseData as UserMovie;
        setCurrentRating(ratingToSubmit);
         setUserMovieList(prevList => {
            const existingIndex = prevList.findIndex(m => m.tmdbId === updatedMovieEntry.tmdbId && m.media_type === updatedMovieEntry.media_type);
            if (existingIndex > -1) {
              const newList = [...prevList];
              newList[existingIndex] = { ...newList[existingIndex], ...updatedMovieEntry };
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
        setRatingFeedback(`Erro: ${errorData.error || 'Falha ao salvar nota'}`);
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
      (video) => video.official && video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
    );
    const targetTrailer = officialTrailer || details?.videos?.results?.find(
        (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
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
    return <div className="text-center text-red-500 pt-28 text-xl bg-[#1E1A1A] min-h-screen">{error}</div>;
  }

  if (!details) {
    return <div className="text-center text-gray-400 pt-28 text-xl bg-[#1E1A1A] min-h-screen">Detalhes não encontrados.</div>;
  }

  const title = (details as MovieResponse).title || (details as ShowResponse).name;
  const releaseDate = (details as MovieResponse).release_date || (details as ShowResponse).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const genres = details.genres?.map((g) => g.name).join(', ') || 'N/A';
  const runtimeOrSeasons = details.media_type === 'movie' 
    ? `${(details as MovieResponse).runtime || '?'} min` 
    : `${(details as ShowResponse).number_of_seasons || '?'} temporada(s)`;
  const ratingTMDB = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

  const director = details.media_type === 'movie' ? details.credits?.crew?.find(c => c.job === 'Director')?.name : undefined;
  const creators = details.media_type === 'tv' ? (details as ShowResponse).created_by?.map(c => c.name).join(', ') : undefined;
  const mainCast = details.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="bg-[#1E1A1A] text-white min-h-screen pt-20">
        <button 
            onClick={() => navigate(-1)}
            className="absolute top-24 md:top-28 left-4 md:left-6 z-20 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
            aria-label="Voltar"
        >
            <ChevronLeft size={28} />
        </button>
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path}`}
          alt={title || "Poster"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A1A] via-transparent to-transparent"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#1E1A1A] via-[#1E1A1A]/50 to-transparent md:w-3/4"></div>

        <div className="absolute bottom-0 left-0 p-4 md:p-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{title}</h1>
          <div className="flex items-center space-x-3 text-gray-300 mb-3 text-sm md:text-base">
            <span>{year}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{runtimeOrSeasons}</span>
            <span className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" /> {ratingTMDB} (TMDB)
            </span>
          </div>
          <p className="text-gray-300 text-xs md:text-sm mb-4 line-clamp-3 md:line-clamp-4">{details.overview || "Sinopse não disponível."}</p>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <div className="flex flex-wrap gap-3 items-center">
            <button 
              onClick={openTrailer}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg flex items-center space-x-2 transition-transform duration-200 hover:scale-105 text-sm md:text-base"
            >
              <PlayCircle size={20}/>
              <span>Assistir Trailer</span>
            </button>
            {isAuthenticated && (
                <>
                    <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`p-2 md:p-3 rounded-full transition-colors ${isFavorite ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} disabled:opacity-50`}
                        aria-label={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    >
                        {favoriteLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-current' : ''}`} />}
                    </button>
                    <div className="flex items-center space-x-1 bg-gray-700 p-1 md:p-2 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                            <Star
                            key={i}
                            className={`w-5 h-5 md:w-6 md:h-6 cursor-pointer ${ (currentRating !== null && i < Math.round(currentRating / 2)) ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-yellow-300'}`}
                            onClick={() => handleRatingChange((i + 1) * 2)}
                            />
                        ))}
                         {currentRating !== null && (
                            <button 
                                onClick={() => handleRatingChange(null)} 
                                className="ml-1 text-xs text-gray-400 hover:text-white"
                                title="Remover nota"
                            >
                                (x)
                            </button>
                        )}
                        {ratingLoading && <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin ml-1 md:ml-2" />}
                    </div>
                </>
            )}
             {!isAuthenticated && (
                 <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base"
                  >
                    <Heart size={20}/> Login para Favoritar/Avaliar
                  </button>
            )}
          </div>
           {ratingFeedback && <p className={`text-xs md:text-sm mt-2 ${ratingFeedback.startsWith("Erro") ? "text-red-400" : "text-green-400"}`}>{ratingFeedback}</p>}
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-md md:text-lg mb-1 text-red-400">Gêneros</h3>
            <p className="text-gray-300 text-sm md:text-base">{genres}</p>
          </div>
          {director && (
            <div>
                <h3 className="font-semibold text-md md:text-lg mb-1 text-red-400">Diretor</h3>
                <p className="text-gray-300 text-sm md:text-base">{director}</p>
            </div>
          )}
           {creators && (
             <div>
                <h3 className="font-semibold text-md md:text-lg mb-1 text-red-400">Criado por</h3>
                <p className="text-gray-300 text-sm md:text-base">{creators}</p>
            </div>
           )}
        </div>
        
        {mainCast.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-4">Elenco Principal</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {mainCast.map((actor) => (
                    <div key={actor.id} className="flex flex-col items-center text-center">
                    <img
                        src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder-person.png'}
                        alt={actor.name}
                        className="w-28 h-36 md:w-32 md:h-40 object-cover rounded-md mb-2 shadow-lg"
                        onError={(e) => (e.currentTarget.src = '/placeholder-person.png')}
                    />
                    <p className="font-semibold text-xs md:text-sm">{actor.name}</p>
                    {actor.character && <p className="text-xs text-gray-400">{actor.character}</p>}
                    </div>
                ))}
                </div>
            </div>
        )}

        {details.media_type === 'tv' && (details as ShowResponse).seasons && ((details as ShowResponse).seasons?.length ?? 0) > 0 && (
             <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-4">Temporadas</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {(details as ShowResponse).seasons!.map(season => (
                        season.poster_path && (season.season_number !== undefined && season.season_number > 0) && (
                            <div key={season.id} className="bg-[#2a2626] p-2 md:p-3 rounded-lg shadow-md text-center">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} 
                                    alt={season.name || `Temporada ${season.season_number}`}
                                    className="w-full h-auto object-cover rounded mb-2"
                                />
                                <p className="font-semibold text-sm md:text-md">{season.name || `Temporada ${season.season_number}`}</p>
                                {season.air_date && <p className="text-xs text-gray-400">Lançamento: {new Date(season.air_date).toLocaleDateString('pt-BR')}</p>}
                                {typeof season.episode_count === 'number' && <p className="text-xs text-gray-400">{season.episode_count} episódios</p>}
                            </div>
                        )
                    ))}
                </div>
            </div>
        )}

      </div>

      {showTrailerModal && trailerKey && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div className="bg-[#1E1A1A] p-2 rounded-lg shadow-xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <iframe
              width="100%"
              height="450"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded"
            ></iframe>
             <button 
                onClick={() => setShowTrailerModal(false)}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
                Fechar Trailer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailsPage;