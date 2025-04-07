import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<string[]>([]);

  const fetchData = (value: string) => {
    fetch(
      `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5&query=${value}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.results) {
          const filteredTitles = data.results
            .filter((movie: { title: string }) =>
              movie.title.toLowerCase().includes(value.toLowerCase())
            )
            .map((movie: { title: string }) => movie.title);
          setTitles(filteredTitles);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleChange = (value: string) => {
    setQuery(value);
    fetchData(value);
  };

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
            {titles.map((title, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer text-black"
              >
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}