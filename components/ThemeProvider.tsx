"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "light" | "dark"
type Lang = "pl" | "en"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  lang: Lang
  toggleLang: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  lang: "pl",
  toggleLang: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [lang, setLang] = useState<Lang>("pl")

  useEffect(() => {
    const saved = localStorage.getItem("nipgo-theme") as Theme | null
    if (saved) setTheme(saved)
    const savedLang = localStorage.getItem("nipgo-lang") as Lang | null
    if (savedLang) setLang(savedLang)
  }, [])

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("nipgo-theme", next)
  }

  function toggleLang() {
    const next = lang === "pl" ? "en" : "pl"
    setLang(next)
    localStorage.setItem("nipgo-lang", next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, toggleLang }}>
      {children}
    </ThemeContext.Provider>
  )
}
