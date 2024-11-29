'use client'
import Link from 'next/link';
import React, {FC, useState, useEffect} from 'react'
import NavItems from '../utils/NavItems';
import {ThemeSwitcher} from '../utils/ThemeSwitcher';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const Header:FC<Props> = ({activeItem}) => {

   const [active, setActive] = useState(false);
   const [openSidebar, setOpenSidebar] = useState(false);

   // might have to use useEffect for scroll instead of attaching event listener directly, ensures that listener is cleaned up when compoennts unmount and avoids memory leaks
    // scroll behavior applying active styles
   useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 85);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // when user scrolled: Applies a semi-transparent background in dark mode, Creates a gradient background in dark mode, fixes header to top of screen, sets w and h, ensures header appears on top w z, animates style chantge over 500ms
  // when no scroll, no changes no fixed positioning 
  return (
    <div className = 'w-full relative'> 
        <div className={`${
         active 
        ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500"
        : "w-full border-b dark:border-[#ffffff1c] h-[80] z-[80] dark:shadow"}`}
        >
            <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                <div className="w-full h-[80px] flex items-center justify-between p-3">
                    <div>
                        <Link href={"/"}
                        className = {`text-[25px] font-Poppins font-[500] text-black dark:text-white`}>
                            Vitalis Solutions Group
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <NavItems
                        activeItem={activeItem}
                        isMobile = {false} />
                        <ThemeSwitcher/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Header