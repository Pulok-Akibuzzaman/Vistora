import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'vistora-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function savedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // index.html sets data-theme before first paint, so start from whatever it chose
  const [theme, setThemeState] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? savedTheme() ?? systemTheme(),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Follow the operating system until the visitor picks a theme themselves
  useEffect(() => {
    const query = window.matchMedia?.(DARK_QUERY)
    if (!query) return
    const onChange = () => {
      if (!savedTheme()) setThemeState(query.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    const apply = () =>
      flushSync(() => {
        document.documentElement.dataset.theme = next
        setThemeState(next)
      })
    // Cross-fade between themes where the browser supports view transitions
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply)
    else apply()
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

// Light-palette hex values used in inline styles, mapped to their theme tokens (see index.css)
const TEXT_TOKENS: Record<string, string> = {
  '#0F172A': 'ink', '#374151': 'graphite', '#64748B': 'muted', '#94A3B8': 'subtle',
  '#DC2626': 'accent', '#BE123C': 'accent-2', '#991B1B': 'accent-strong',
  '#059669': 'positive', '#065F46': 'positive-strong', '#D97706': 'caution', '#92400E': 'caution-strong',
  '#9F1239': 'rose-strong', '#3730A3': 'indigo-strong', '#1D4ED8': 'blue-strong',
}
const BG_TOKENS: Record<string, string> = {
  '#FEE2E2': 'electric-dim', '#FFE4E6': 'violet-dim', '#F1F5F9': 'surface-3', '#E2E8F0': 'divider',
  '#F0FDF4': 'success-soft', '#D1FAE5': 'success-muted', '#FEF9C3': 'yellow-soft', '#E0E7FF': 'indigo-soft', '#EFF6FF': 'blue-soft',
}

const tokenVar = (tokens: Record<string, string>, hex: string) => {
  const token = tokens[hex.toUpperCase()]
  return token ? `var(--t-${token}, ${hex})` : hex
}

/** Inline-style text color that follows the theme (unknown colors pass through unchanged) */
export const themeText = (hex: string) => tokenVar(TEXT_TOKENS, hex)

/** Inline-style background color that follows the theme (unknown colors pass through unchanged) */
export const themeBg = (hex: string) => tokenVar(BG_TOKENS, hex)

/** Sun/moon button that flips between light and dark */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={`h-9 w-9 flex items-center justify-center border transition-colors ${className}`}
      style={{ borderRadius: 3 }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
