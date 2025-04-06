"use client";

import DesktopHeaderMenu from "./headerComponents/desktopHeader";
import MobileHeaderMenu from "./headerComponents/mobileHeader";
import SearchBar from "./headerComponents/searchBar";

const Header: React.FC = () => {

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
          <div className="hidden md:flex gap-x-2 w-full">
            <ul className="md:flex items-center justify-center gap-x-2">
              {Menu.map((menu) => (
                <DesktopHeaderMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            <SearchBar />
          </div>

          <div className="md:hidden gap-x-2 flex justify-between items-center w-full">
            <div className="">
              <MobileHeaderMenu Menus={Menu}/>
            </div>
            <SearchBar />
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
