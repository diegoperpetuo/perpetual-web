import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Film, Mail, UserCircle, CalendarDays, Loader2 } from 'lucide-react';
import MovieCard from '../components/movieListComponents/movieCard';
import tmdbService, { MovieResult, TvResult } from "../services/tmdbService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

type FavoriteDisplayItem = (MovieResult | TvResult) & {
  userFavoriteData: UserMovieListItem;
};

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
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchAllData = async () => {
      if (!token) return;

      setIsLoadingProfile(true);
      setIsLoadingFavorites(true);
      setErrorLoadingProfile(null);

      try {
        // Buscar gêneros e dados do perfil em paralelo
        const [genres, profileResponse, moviesResponse] = await Promise.all([
          tmdbService.getAllGenres(),
          fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/user/movies`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        // Processar gêneros
        setGenresMap(genres);

        // Processar perfil
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Falha ao buscar perfil do usuário.');
        }
        const profile: UserProfileData = await profileResponse.json();
        setProfileData(profile);

        // Processar filmes favoritos
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
          try {
            const details = await tmdbService.getMultipleItems(favoriteItems);
            setFavoriteMoviesDetails(details as unknown as FavoriteDisplayItem[]);
          } catch (error) {
            console.error("Erro ao buscar detalhes dos favoritos:", error);
            setErrorLoadingProfile("Erro ao carregar detalhes dos favoritos.");
          }
        } else {
          setFavoriteMoviesDetails([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        setErrorLoadingProfile(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingFavorites(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, token, authLoading, navigate]);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#1E1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-[#1E1A1A] text-white pt-24">
      <div className="container mx-auto px-4">
        {errorLoadingProfile && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{errorLoadingProfile}</p>
          </div>
        )}

        {/* Header do Perfil */}
        <div className="bg-[#2a2626] rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profileData?.name || 'Usuário'}</h1>
              <p className="text-gray-400 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {profileData?.email || 'email@example.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E1A1A] p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-red-500" />
                <span className="text-gray-400">Favoritos</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {profileData?.favoriteMoviesCount || 0}
              </p>
            </div>

            <div className="bg-[#1E1A1A] p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-red-500" />
                <span className="text-gray-400">Membro desde</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {profileData?.createdAt ? formatDate(profileData.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Favoritos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Film className="w-6 h-6 mr-2 text-red-500" />
            Meus Favoritos
          </h2>

          {isLoadingFavorites ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-red-500" />
            </div>
          ) : favoriteMoviesDetails.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favoriteMoviesDetails.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  movie={item as any}
                  showGenres={true}
                  showHD={true}
                  genresMap={genresMap}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-gray-500">
                Comece a adicionar filmes e séries aos seus favoritos!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;