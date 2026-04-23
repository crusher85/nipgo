"use client"

import { ThemeProvider, useTheme } from "@/components/ThemeProvider"
import { Navbar } from "@/components/Navbar"

function Inner({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, lang, toggleLang } = useTheme()

  return (
    <div style={{
      minHeight: "100vh",
      background: theme === "dark" ? "#0a0a0a" : "#f8f9fb",
      color: theme === "dark" ? "#f5f5f5" : "#111",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      transition: "background 0.2s, color 0.2s",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');* { box-sizing: border-box; } a { text-decoration: none; color: inherit; }`}</style>
      <Navbar theme={theme} onThemeToggle={toggleTheme} lang={lang} onLangToggle={toggleLang} />
      {children}
    </div>
  )
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Inner>{children}</Inner>
    </ThemeProvider>
  )
}
