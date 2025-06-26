import { CircleUser, LogOut, Search } from 'lucide-react';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./headerComponents/searchBar";
import MobileSearch from "./headerComponents/mobileSearch";

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<{ id: string; title: string; media_type: string }[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
        <header className="h-16 sm:h-20 md:h-24 text-[15px] inset-0 flex items-center">
            <nav className="px-3 sm:px-4 md:px-6 flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
            </nav>
        </header>
    );
  }

  return (
    <>
      <header className="h-16 sm:h-20 md:h-24 text-[15px] inset-0 flex items-center">
        <nav className="px-3 sm:px-4 md:px-6 flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img src="/logo.png" alt="Perpetual Logo" className="h-6 sm:h-8 md:h-10 w-auto" />
          </Link>

          {/* SearchBar - oculta em telas muito pequenas */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-4 md:mx-8">
            <SearchBar 
              query={query}
              setQuery={setQuery}
              titles={titles}
              setTitles={setTitles}
            />
          </div>

          {/* Botão de busca mobile */}
          <div className="flex-1 flex justify-end sm:hidden">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 text-white hover:text-red-500 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link
                to="/profile"
                className="flex items-center gap-1 sm:gap-2 text-white hover:text-red-500 transition-colors p-1 sm:p-2"
              >
                <CircleUser className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden lg:inline">Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-white hover:text-red-500 transition-colors p-1 sm:p-2"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden lg:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link
                to="/login"
                className="text-white hover:text-red-500 transition-colors text-sm sm:text-base flex items-center justify-center h-9 sm:h-auto min-w-[70px]"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2 sm:py-2 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center h-9 sm:h-auto min-w-[90px]"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Search Modal */}
      <MobileSearch
        query={query}
        setQuery={setQuery}
        titles={titles}
        setTitles={setTitles}
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
};

export default Header;