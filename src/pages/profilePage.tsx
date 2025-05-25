import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Film, Mail, UserCircle, CalendarDays, Loader2 } from 'lucide-react';
import MovieCard from '../components/movieListComponents/movieCard';
import { MovieResult, TvResult, MovieDb, MovieResponse, ShowResponse } from "moviedb-promise";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const moviedb = new MovieDb("73628ed5a3ca37355ba6d16fdb8b4a23"); //


interface UserProfileData {
  name: string;
  email: string;
  createdAt: string;
  favoriteMoviesCount: number;
}

interface UserMovieListItem {
  tmdbId: number;
  rating?: number | null;
  favorite?: boolean;
  _id?: string;
  media_type: 'movie' | 'tv';
}

type FavoriteDisplayItem = (MovieResult | TvResult) & { userFavoriteData?: UserMovieListItem };


function ProfilePage() {
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [favoriteMoviesDetails, setFavoriteMoviesDetails] = useState<FavoriteDisplayItem[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [genresMap, setGenresMap] = useState<{ [key: number]: string }>({});
  const [errorLoadingProfile, setErrorLoadingProfile] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data indisponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenresRes, tvGenresRes] = await Promise.all([
          moviedb.genreMovieList({ language: "pt-BR" }),
          moviedb.genreTvList({ language: "pt-BR" })
        ]);
        const map: { [key: number]: string } = {};
        movieGenresRes.genres?.forEach((g) => {
          if (g.id !== undefined && g.name) map[g.id] = g.name;
        });
        tvGenresRes.genres?.forEach((g) => {
          if (g.id !== undefined && g.name) map[g.id] = g.name;
        });
        setGenresMap(map);
      } catch (error) {
        console.error("Erro ao buscar gêneros do TMDB:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfileAndFavorites = async () => {
      if (!token) return;

      setIsLoadingProfile(true);
      setIsLoadingFavorites(true);
      setErrorLoadingProfile(null);

      try {
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Falha ao buscar perfil do usuário.');
        }
        const profile: UserProfileData = await profileResponse.json();
        setProfileData(profile);
        setIsLoadingProfile(false);

        const moviesResponse = await fetch(`${API_BASE_URL}/api/user/movies`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!moviesResponse.ok) {
            const errorData = await moviesResponse.json();
            throw new Error(errorData.error || 'Falha ao buscar lista de filmes do usuário.');
        }
        const userMovieListFromAPI: UserMovieListItem[] = await moviesResponse.json();
        const favoriteItems = userMovieListFromAPI.filter(movie => movie.favorite);
        
        if (profile && favoriteItems.length !== profile.favoriteMoviesCount) {
            setProfileData(prev => prev ? {...prev, favoriteMoviesCount: favoriteItems.length} : null);
        }

        if (favoriteItems.length > 0) {
          const detailsPromises = favoriteItems.map(async (favItem) => {
            if (!favItem.media_type) {
                console.warn(`Item favorito com tmdbId ${favItem.tmdbId} não possui media_type. Pulando.`);
                return null;
            }
            try {
              let tmdbDetail: MovieResponse | ShowResponse | undefined;
              let constructedDetail: MovieResult | TvResult | undefined;

              if (favItem.media_type === 'movie') {
                tmdbDetail = await moviedb.movieInfo({ id: favItem.tmdbId, language: "pt-BR" });
                if (tmdbDetail && tmdbDetail.id) {
                  constructedDetail = { ...(tmdbDetail as MovieResponse), media_type: 'movie' } as MovieResult;
                }
              } else if (favItem.media_type === 'tv') {
                tmdbDetail = await moviedb.tvInfo({ id: favItem.tmdbId, language: "pt-BR" });
                if (tmdbDetail && tmdbDetail.id) {
                  constructedDetail = { ...(tmdbDetail as ShowResponse), media_type: 'tv' } as TvResult;
                }
              } else {
                console.warn(`media_type desconhecido: ${favItem.media_type} para tmdbId ${favItem.tmdbId}`);
                return null;
              }

              if (constructedDetail) {
                return { ...constructedDetail, userFavoriteData: favItem } as FavoriteDisplayItem;
              }
            } catch (error) {
              console.warn(`Erro ao buscar detalhes para ${favItem.media_type} ID ${favItem.tmdbId}:`, error);
              return null;
            }
            return null;
          });

          const resolvedDetails = (await Promise.all(detailsPromises)).filter(detail => detail !== null) as FavoriteDisplayItem[];
          setFavoriteMoviesDetails(resolvedDetails);
        } else {
          setFavoriteMoviesDetails([]);
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados do perfil ou lista de filmes:", error);
        setErrorLoadingProfile(error.message || "Ocorreu um erro ao carregar os dados.");
        setIsLoadingProfile(false);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchProfileAndFavorites();
  }, [isAuthenticated, token, navigate, authLoading]);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="bg-[#1E1A1A] text-white min-h-screen flex flex-col items-center justify-center p-4 pt-28">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="mt-4 text-xl">Carregando perfil...</p>
      </div>
    );
  }

  if (errorLoadingProfile || !profileData) {
    return (
      <div className="bg-[#1E1A1A] text-white min-h-screen flex flex-col items-center justify-center p-4 pt-28">
        <p className="text-xl text-red-500">{errorLoadingProfile || "Não foi possível carregar os dados do perfil."}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1A1A] text-white min-h-screen p-4 md:p-8 pt-28">
      <div className="max-w-5xl mx-auto">
        <section className="bg-[#373232] p-6 rounded-lg shadow-xl mb-10">
          <h1 className="text-3xl font-bold text-red-500 mb-6 border-b-2 border-red-500 pb-2">
            Meu Perfil
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div className="flex items-center space-x-3">
              <UserCircle className="w-7 h-7 text-red-400" />
              <p><span className="font-semibold">Nome:</span> {profileData.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-7 h-7 text-red-400" />
              <p><span className="font-semibold">E-mail:</span> {profileData.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Film className="w-7 h-7 text-red-400" />
              <p><span className="font-semibold">Favoritos:</span> {profileData.favoriteMoviesCount}</p>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-7 h-7 text-red-400" />
              <p><span className="font-semibold">Membro desde:</span> {formatDate(profileData.createdAt)}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-500 mb-6 border-b-2 border-red-500 pb-2">
            Meus Favoritos
          </h2>
          {isLoadingFavorites ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              <p className="ml-3 text-lg">Carregando favoritos...</p>
            </div>
          ) : favoriteMoviesDetails.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteMoviesDetails.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  movie={item}
                  showGenres={true}
                  genresMap={genresMap}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10 text-lg">
              Você ainda não adicionou nenhum filme ou série aos seus favoritos.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;