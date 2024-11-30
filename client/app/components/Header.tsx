'use client';

import Link from 'next/link';
import React, { FC, useState, useEffect } from 'react';
import NavItems from '../utils/NavItems';
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from 'react-icons/hi';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
};

const Header: FC<Props> = ({ activeItem, setOpen }) => {
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  // Handles closing the sidebar when clicking outside
  const handleClose = (e: any) => {
    if (e.target.id === 'screen') {
      setOpenSidebar(false);
    }
  };

  // Use useEffect to attach and clean up scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 85);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="w-full relative">
      <div
        className={`${
          active
            ? 'dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500'
            : 'w-full border-b dark:border-[#ffffff1c] h-[80] z-[80] dark:shadow'
        }`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
          <div className="w-full h-[80px] flex items-center justify-between p-3">
            <div>
              <Link
                href={'/'}
                className="text-[25px] font-Poppins font-[500] text-black dark:text-white"
              >
                Vitalis Solutions Group
              </Link>
            </div>
            <div className="flex items-center">
              <NavItems activeItem={activeItem} isMobile={false} />
              <div className="800px:hidden">
                <HiOutlineMenuAlt3
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                />
              </div>
              <HiOutlineUserCircle
                size={25}
                className="hidden 800px:block cursor-pointer dark:text-white text-black"
                onClick={() => setOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Sidebar */}
      {openSidebar && (
        <div
          className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
          onClick={handleClose}
          id="screen"
        >
          <div className="w-[70%] fixed z-[999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
            <div className="w-full text-center py-6">
              <Link
                href={'/'}
                className="text-[25px] font-Poppins font-[500] text-black dark:text-white"
              >
                VSG
              </Link>
            </div>
            <NavItems activeItem={activeItem} isMobile={true} />
            <HiOutlineUserCircle
              size={25}
              className="cursor-pointer ml-5 my-2 dark:text-white text-black"
              onClick={() => setOpen(true)}
            />
            <br />
            <br />
            <p className="text-white text-center">
              Copyright 2024 Vitalis Solutions Group
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
