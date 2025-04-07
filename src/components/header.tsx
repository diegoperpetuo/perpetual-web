"use client";

import DesktopHeaderMenu from "./headerComponents/desktopHeader";
import MobileHeaderMenu from "./headerComponents/mobileHeader";
import SearchBar from "./headerComponents/searchBar";
import { useState } from "react";

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<string[]>([]);

  const Menu = [
    { name: "Início", link: "/" },
    { name: "Gênero", link: "" },
    { name: "País", link: "" },
    { name: "Filmes", link: "" },
    { name: "Séries", link: "" },
    { name: "Animações", link: "" },
  ];

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
    <div>
      <header className="h-24 text-[15px] inset-0 flex items-center">
        <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="hidden md:flex gap-x-2 w-full">
            <ul className="md:flex items-center justify-center gap-x-2">
              {Menu.map((menu) => (
                <DesktopHeaderMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            
            <SearchBar query={query} titles={titles} handleChange={handleChange} />
          </div>

          <div className="md:hidden gap-x-2 flex justify-between items-center w-full">
            <div>
              <MobileHeaderMenu Menus={Menu} />
            </div>
            
            <SearchBar query={query} titles={titles} handleChange={handleChange} />
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;