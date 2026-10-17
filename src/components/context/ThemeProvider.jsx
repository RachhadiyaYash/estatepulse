import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext, THEME_STORAGE_KEY } from './ThemeContext'

const THEME_COLORS = { light: '#f5f7fb', dark: '#0a0a0b' }
const MODES = ['light', 'dark', 'system']

function readStoredMode() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // follow OS changes (only matters while mode === 'system')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  // apply to <html>: the `dark` class powers Tailwind's `dark:` variant
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.setAttribute('data-theme', resolvedTheme)
    root.setAttribute('data-theme-mode', mode)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[resolvedTheme])
  }, [mode, resolvedTheme])

  const setMode = useCallback((next) => {
    if (!MODES.includes(next)) return
    setModeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage blocked: theme still applies for this session */
    }
  }, [])

  const toggle = useCallback(
    () => setMode(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setMode],
  )

  const value = useMemo(
    () => ({ mode, resolvedTheme, isDark: resolvedTheme === 'dark', setMode, toggle }),
    [mode, resolvedTheme, setMode, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
