import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tmdbService from "../../services/tmdbService";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  titles: Array<{ id: string; title: string; media_type: string }>;
  setTitles: (titles: Array<{ id: string; title: string; media_type: string }>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, titles, setTitles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (value: string) => {
    if (value.trim() === "") {
      setTitles([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await tmdbService.searchMulti(value);
      
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
    } catch (error) {
      console.error("Error fetching data:", error);
      setTitles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    fetchData(value);
  };

  const handleSelect = (title: { id: string; title: string; media_type: string }) => {
    setQuery(title.title);
    setTitles([]);
    setIsOpen(false);
    navigate(`/${title.media_type}/${title.id}`);
  };

  const clearSearch = () => {
    setQuery("");
    setTitles([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar filmes, séries..."
          className="w-full pl-10 pr-10 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-gray-700 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (query || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2">Buscando...</p>
            </div>
          ) : titles.length > 0 ? (
            <div>
              {titles.map((title) => (
                <button
                  key={`${title.media_type}-${title.id}`}
                  onClick={() => handleSelect(title)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {title.media_type === 'movie' ? 'F' : 'S'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{title.title}</p>
                      <p className="text-gray-400 text-sm">
                        {title.media_type === 'movie' ? 'Filme' : 'Série'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-400">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
