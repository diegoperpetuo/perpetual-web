import { useEffect } from "react";
import { X, Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function MobileHeaderMenu({ Menus }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    return (
        <div>
            <button 
                className="z-[999] relative"
                onClick={toggleDrawer}>
                {isOpen ? <X className="text-white"/> : <Menu className="text-white"/>}
            </button>

            <motion.div 
                className="fixed left-0 right-0 top-24 overflow-y-auto h-full bg-[#1E1A1A] text-white p-6 z-[50]"
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? "0%" : "-100%" }}
            >
                <ul>
                    {Menus?.map(({ name, link }) => (
                        <li key={name}>
                            <a href={link}>
                                <span className="flex items-center justify-between p-4 text-lg hover:bg-white/5 rounded-md cursor-pointer relative">
                                    {name}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
}