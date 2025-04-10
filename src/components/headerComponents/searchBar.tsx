import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  titles: { id: string; title: string; media_type: string }[];
  handleChange: (value: string) => void;
}


export default function SearchBar({ query,setQuery, titles, handleChange }: SearchBarProps) {
  
  const navigate = useNavigate();
  

  return (
    <div className="relative flex flex-col items-center w-full max-w-md">
      <div className="relative w-full">
        <input
          className="bg-white p-2 pr-10 pl-4 w-full rounded-3xl text-black placeholder:text-black focus:outline-none"
          type="text"
          placeholder="Pesquisar produções..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
      </div>

      {titles.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white flex flex-col rounded-lg shadow-lg max-h-80 overflow-y-scroll z-50">
          <ul>
            {titles.map((movie) => (
              <li
              onClick={() => {
                navigate(`/detalhes/${movie.media_type}/${movie.id}`);
                setQuery(""); 
              }}
              
                key={movie.id}
                className="p-2 hover:bg-gray-200 cursor-pointer text-black"
              >
                {movie.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
