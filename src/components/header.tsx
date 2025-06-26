import { CircleUser, LogOut } from 'lucide-react';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./headerComponents/searchBar";

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<{ id: string; title: string; media_type: string }[]>([]);
  const { isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

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
    <header className="h-24 text-[15px] inset-0 flex items-center">
      <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src="/logo.png" alt="Perpetual Logo" className="h-8 md:h-10 w-auto" />
        </Link>

        <div className="flex-1 max-w-2xl mx-4 md:mx-8">
          <SearchBar 
            query={query}
            setQuery={setQuery}
            titles={titles}
            setTitles={setTitles}
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
            >
              <CircleUser className="w-6 h-6" />
              <span className="hidden md:inline">Perfil</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
            >
              <LogOut className="w-6 h-6" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              to="/login"
              className="text-white hover:text-red-500 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cadastrar
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;