"use client";

import {} from "react";
// import DesktopHeaderMenu from "./Header_components/DesktopHeaderMenu";
// import MobileHeaderMenu from "./Header_components/MobileHeaderMenu";

const Header: React.FC = () => {
  
  const Menu = [
    {
    name:"Início",
    link: "/"
    },
    {
    name: "Gênero",
    link: ""
    },
    {
    name: "País",
    link: ""
    },
    {
    name: "Filmes",
    link: ""  
    },
    {
    name: "Séries",
    link: ""
    },
    {
    name: "Animações",
    link: ""   
    },
  ]

  return (
    <div>
      <header className="h-24 text-[15px] inset-0 flex items-center">
        <nav className="px-3.5 flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-x-3 z-[999] relative">
          </div>
          {/* <ul className="md:flex items-center justify-center hidden gap-x-1">
            {Menu.map((menu) => (
                <DesktopHeaderMenu menu={menu} key={menu.name}/>
            ))}
          </ul> */}
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
