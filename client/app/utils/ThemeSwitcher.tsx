'use client'
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {BiMoon, BiSun} from "react-icons/bi";

export const ThemeSwitcher = () => {
    
    const [mounted,setMounted] = useState(false); // tracks if component is mounted
    const {theme, setTheme} = useTheme();
    useEffect(() => setMounted(true), []);
    
    useEffect(() => {
        setMounted(true); // Sets mounted to true after the component is mounted
      }, []);

    if(!mounted){
        return null // prevents rendering until the component is mounted
    }
    return (
        <div className = "flex items-center justify-center mx-4">
            {theme === "light" ? (
                    <BiMoon
                    className="cursor-pointer"
                    fill="black"
                    size={25}
                    onClick={() => setTheme("dark")}
                    />
                ) : (
                    <BiSun
                    className="cursor-pointer"
                    size={25}
                    onClick={() => setTheme("light")}
                    />
                )}
            
        </div>
    )
}