'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

interface ThemeContextType {
  theme: string
  mode: string
  setTheme: (theme: string) => void
  setMode: (mode: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// applyWithTransition: Wraps state updates in the javascript Transition API for smooth visual crossfades
const applyWithTransition = (cb: () => void) => {
  // If document.startViewTransition doesn't exists=> run the function immdiately, else pass hte callback(changes states) function to it.
  if (!document.startViewTransition) {
    cb()
    return
  }
  document.startViewTransition(cb)
}

// ThemeProvider: Wrapper component that manages theme/mode states and broadcasts them down the tree
export const ThemeProvider = ({
  children,
  defaultTheme = 'tally',
  defaultMode = 'light',
}: {
  children: React.ReactNode
  defaultTheme?: string
  defaultMode?: string
}) => {
  // Server-safe initial states to prevent hydration mismatch
  const [theme, setThemeState] = useState(defaultTheme)
  const [mode, setModeState] = useState(defaultMode)

  // Sync state with localStorage on mount (after hydration)
  useEffect(() => {
    const savedTheme = localStorage.getItem('data-theme-name')
    const savedMode = localStorage.getItem('data-mode')

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme-name', savedTheme)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme-name', defaultTheme)
    }

    if (savedMode) {
      document.documentElement.setAttribute('data-mode', savedMode)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModeState(savedMode)
    } else {
      document.documentElement.setAttribute('data-mode', defaultMode)
    }
  }, [defaultTheme, defaultMode])

  // setTheme: Updates theme state, sets the HTML attribute, and persists it to localStorage
  const setTheme = useCallback((newTheme: string) => {
    applyWithTransition(() => {
      // we are changing all three things.
      setThemeState(newTheme)
      document.documentElement.setAttribute('data-theme-name', newTheme)
      localStorage.setItem('data-theme-name', newTheme)
    })
  }, [])

  // setMode: Updates mode (light/dark) state, sets the HTML attribute, and persists it to localStorage
  const setMode = useCallback((newMode: string) => {
    //document.startViewTransition: helps in crossfadding things smoothly.
    applyWithTransition(() => {
      setModeState(newMode)
      document.documentElement.setAttribute('data-mode', newMode)
      localStorage.setItem('data-mode', newMode)
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// useTheme: Custom hook allowing consumer components to access the active theme and mode context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
