"use client"

import { Search, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function PageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              KRS
            </div>
            <span className="hidden font-semibold text-foreground sm:inline-block">
              Rejestr Firm
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center px-4 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Szukaj firmy (NIP, KRS, nazwa)..." 
              className="w-full pl-9 h-9 bg-secondary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Zaloguj się
          </Button>
          <Button size="sm">
            Rejestracja
          </Button>
        </div>
      </div>
    </header>
  )
}

export function BackNavigation() {
  return (
    <div className="mb-4">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Powrót do wyników wyszukiwania
      </Link>
    </div>
  )
}
