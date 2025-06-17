import { CircleUser, LogOut } from 'lucide-react';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DesktopHeaderMenu from "./headerComponents/desktopHeader";
import MobileHeaderMenu from "./headerComponents/mobileHeader";
import SearchBar from "./headerComponents/searchBar";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<{ id: string; title: string; media_type: string }[]>([]);
  const { isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const Menu = [
    { name: "Início", link: "/" },
    { name: "Gênero", link: "" },
    { name: "País", link: "" },
    { name: "Filmes", link: "" },
    { name: "Séries", link: "" },
    { name: "Animações", link: "" },
  ];

  const fetchData = (value: string) => {
    if (value.trim() === "") {
      setTitles([]);
      return;
    }
    if (!TMDB_API_KEY) {
        console.error("Chave da API TMDB não configurada para SearchBar.");
        setTitles([]);
        return;
    }

    fetch(
      `https://api.themoviedb.org/3/search/multi?include_adult=false&page=1&language=pt-BR&api_key=${TMDB_API_KEY}&query=${value}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.results) {
          const filteredTitles = data.results
            .filter(
              (item: { title?: string; name?: string; media_type: string }) =>
                (item.title || item.name) &&
                item.media_type !== "person" &&
                (item.title?.toLowerCase().includes(value.toLowerCase()) ||
                  item.name?.toLowerCase().includes(value.toLowerCase()))
            )
            .map((item: { id: string; title?: string; name?: string; media_type: string }) => ({
              id: item.id,
              title: item.title || item.name || 'Título Desconhecido',
              media_type: item.media_type,
            }));
          setTitles(filteredTitles);
        } else {
          setTitles([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setTitles([]);
      });
  };

  const handleChange = (value: string) => {
    setQuery(value);
    fetchData(value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
        <header className="h-24 text-[15px] inset-0 flex items-center">
            <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
            </nav>
        </header>
    );
  }

  return (
    <div>
      <header className="h-24 text-[15px] inset-0 flex items-center bg-[#1E1A1A] bg-opacity-80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <nav className="px-3.5 flex items-center justify-between w-full max-w-screen-xl mx-auto gap-4">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-red-500 transition-colors" title="Página Inicial">
            <img src="/fav_logo.png" alt="Logo Perpetual" className="h-10 w-10"/>
            <span className="font-bold text-xl hidden sm:block">Perpetual</span>
          </Link>

          <div className="hidden md:flex items-center justify-center flex-grow gap-x-4">
            <ul className="md:flex items-center justify-center gap-x-2">
              {Menu.map((menu) => (
                <DesktopHeaderMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            <div className="w-full max-w-lg">
                <SearchBar query={query} titles={titles} handleChange={handleChange} />
            </div>
          </div>

          <div className="md:hidden flex items-center justify-end flex-grow gap-x-3">
            <div className="w-full max-w-xs">
                <SearchBar query={query} titles={titles} handleChange={handleChange} />
            </div>
            <MobileHeaderMenu Menus={Menu} />
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-[#2b2b2b] transition-all duration-300"
                  title="Meu Perfil"
                >
                  <CircleUser className="text-white w-8 h-8" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-[#2b2b2b] transition-all duration-300"
                  title="Sair"
                >
                  <LogOut className="text-white w-7 h-7" />
                </button>
              </div>
            ) : (
              <button // Mudado de <a> para <button> para melhor semântica de ação
                onClick={() => navigate("/login")}
                className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-[#2b2b2b] transition-all duration-300 cursor-pointer"
                title="Login"
              >
                <CircleUser className="text-white w-8 h-8" />
              </button>
            )}
          </div>
        </nav>
      </header>
      <div className="h-24" />
    </div>
  );
};

export default Header;