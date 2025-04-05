import { motion } from "framer-motion";

export default function DesktopHeaderMenu({ menu }) {
    return (
        <motion.li
            className="group/link"
        > 
                <a href={menu.link}>
                    <span className="flex gap-1 cursor-pointer px-3 py-1 rounded-xl text-white text-lg hover:bg-white/5">
                        {menu.name}
                    </span>
                </a>
        
        </motion.li>
    );
}