import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

/**
 * const { mode, resolvedTheme, isDark, setMode, toggle } = useTheme()
 *   setMode('light' | 'dark' | 'system')
 *   toggle()  // flips between light and dark
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

export default useTheme
