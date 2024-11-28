'use client'
import React, {FC, useState} from 'react'

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const Header:FC<Props> = (props) => {

   const [active, setActive] = useState(false);
   const [openSidebar, setOpenSidebar] = useState(false);

   // might have to use useEffect for scroll instead of attaching event listener directly, ensures that listener is cleaned up when compoennts unmount and avoids memory leaks
   
   /* useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
    };
  */
   if(typeof window !== "undefined"){
    window.addEventListener("scroll", () => {
        if(window.scrollY > 80){
            setActive(true)
        } else {
            setActive(false);
        }
    })
   }

  // when user scrolled: Applies a semi-transparent background in dark mode, Creates a gradient background in dark mode, fixes header to top of screen, sets w and h, ensures header appears on top w z, animates style chantge over 500ms
  // when no scroll, no changes no fixed positioning 
  return (
    <div className = 'w-full relative'> 
        <div className={`${
         active 
        ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500"
        : "w-full border-b dark:border-[#ffffff1c] h-[80] z-[80] dark:shadow"}`}
        ></div>
    </div>
  )
}

export default Header