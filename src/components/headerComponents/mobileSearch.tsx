import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tmdbService, { MovieResult, TvResult } from "../../services/tmdbService";

interface MobileSearchProps {
  query: string;
  setQuery: (query: string) => void;
  titles: Array<{ id: string; title: string; media_type: string }>;
  setTitles: (titles: Array<{ id: string; title: string; media_type: string }>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearch: React.FC<MobileSearchProps> = ({ 
  query, 
  setQuery, 
  titles, 
  setTitles, 
  isOpen, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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
            (item: MovieResult | TvResult) => {
              const title = 'title' in item ? item.title : (item as TvResult).name;
              return title && title.toLowerCase().includes(value.toLowerCase());
            }
          )
          .map((item: MovieResult | TvResult) => {
            const title = 'title' in item ? item.title : (item as TvResult).name;
            return {
              id: item.id.toString(),
              title: title || 'Título Desconhecido',
              media_type: item.media_type || 'movie',
            };
          });
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
    onClose();
    navigate(`/detalhes/${title.media_type}/${title.id}`);
  };

  const clearSearch = () => {
    setQuery("");
    setTitles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-start justify-center pt-20">
      <div ref={searchRef} className="w-full max-w-md mx-4">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Buscar</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Buscar filmes, séries..."
                className="w-full pl-10 pr-10 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
          </div>

          {/* Results */}
          {(query || isLoading) && (
            <div className="max-h-64 overflow-y-auto no-scrollbar border-t border-gray-700">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-red-500 mx-auto"></div>
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
      </div>
    </div>
  );
};

export default MobileSearch; 