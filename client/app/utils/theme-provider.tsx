'use client'

import * as React from 'react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import type { ThemeProviderProps } from 'next-themes/dist/types';

// theme provider wraps the app and manages the theme
export function ThemeProvider({children, ...props} : ThemeProviderProps){
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}