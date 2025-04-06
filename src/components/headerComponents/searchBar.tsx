import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  // State to manage the search query, will be used to filter the movies with the API later
  const [query, setQuery] = useState("");
  return (
    <div className="relative flex items-center w-full max-w-md">
      <input
        className="bg-white p-2 pr-10 pl-4 w-full rounded-3xl text-black placeholder:text-black focus:outline-none"
        type="text"
        placeholder="Pesquisar produções..."
        value={query}
        onChange={(e) => {setQuery(e.target.value); 
            console.log(e.target.value); 
        }}
      />
      <Search className="absolute right-3 text-black" />
    </div>
  );
}
