"use client";

import DesktopHeaderMenu from "./headerComponents/desktopHeader";
import MobileHeaderMenu from "./headerComponents/mobileHeader";
import SearchBar from "./headerComponents/searchBar";
import { CircleUser } from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState<{ id: string; title: string; media_type: string }[]>([]);

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
    fetch(
      `https://api.themoviedb.org/3/search/multi?include_adult=false&page=1&language=pt-BR&api_key=12923231fddd461a9280cdc286a6bee5&query=${value}`
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
              title: item.title || item.name,
              media_type: item.media_type,
            }));
  
          setTitles(filteredTitles);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  

  const handleChange = (value: string) => {
    setQuery(value);
    
    if (value.trim() === ""){
      setTitles([]);
      return;
    }

    fetchData(value);
  };

  return (
    <div>
      <header className="h-24 text-[15px] inset-0 flex items-center">
        <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
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
          <div>
            <a 
              onClick={() => navigate("/login")}
              className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-[#2b2b2b] transition-all duration-300"
              >
              <CircleUser className="text-white w-8 h-8" />
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;