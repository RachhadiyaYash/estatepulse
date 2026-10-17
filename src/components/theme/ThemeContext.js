import { createContext } from 'react'

export const THEME_STORAGE_KEY = 'app_theme_mode'

/** Value shape: { mode: 'light' | 'dark' | 'system', resolvedTheme: 'light' | 'dark', setMode, toggle } */
export const ThemeContext = createContext(null)
