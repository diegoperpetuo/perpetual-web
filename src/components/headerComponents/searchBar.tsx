import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  // State to manage the search query, will be used to filter the movies with the API later
  const [query, setQuery] = useState("");

  const fetchData = (value: string) => {
    fetch(`https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5&query=${value}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  const handleChange = (value: string) => {
    setQuery(value);
    fetchData(value);
  }

  return (
    <div className="relative flex items-center w-full max-w-md">
      <input
        className="bg-white p-2 pr-10 pl-4 w-full rounded-3xl text-black placeholder:text-black focus:outline-none"
        type="text"
        placeholder="Pesquisar produções..."
        value={query}
        onChange={(e) => {handleChange(e.target.value); 
            console.log(e.target.value); 
        }}
      />
      <Search className="absolute right-3 text-black" />
    </div>
  );
}
