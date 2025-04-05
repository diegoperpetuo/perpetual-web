"use client";

import { useState } from "react";
import { Search } from 'lucide-react';
import DesktopHeaderMenu from "./headerComponents/desktopHeader";
// import MobileHeaderMenu from "./Header_components/MobileHeaderMenu";

const Header: React.FC = () => {
    // State to manage the search query, will be used to filter the movies with the API later
  const [query, setQuery] = useState("");

  const Menu = [
    {
      name: "Início",
      link: "/",
    },
    {
      name: "Gênero",
      link: "",
    },
    {
      name: "País",
      link: "",
    },
    {
      name: "Filmes",
      link: "",
    },
    {
      name: "Séries",
      link: "",
    },
    {
      name: "Animações",
      link: "",
    },
  ];

  return (
    <div>
      <header className="h-24 text-[15px] inset-0 flex items-center">
        <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="hidden md:flex gap-x-2">
            <ul className="md:flex items-center justify-center gap-x-2">
              {Menu.map((menu) => (
                <DesktopHeaderMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            <div className="relative flex items-center w-full max-w-md">
  <input
    className="bg-white p-2 pr-10 pl-4 w-full rounded-lg text-black placeholder:text-black focus:outline-none"
    type="text"
    placeholder="Pesquisar produções..."
    onChange={(e) => setQuery(e.target.value)}
  />
  <Search className="absolute right-3 text-black" />
</div>
          </div>

          <div className="md:hidden">
            {/* <div className="">
              <MobileHeaderMenu Menus={Menu}/>
            </div> */}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
