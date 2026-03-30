"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download, FileText, Share2, Star, Bell,
  Printer, ExternalLink, MapPin, Building, Phone, Mail
} from "lucide-react"

interface SidebarActionsProps {
  companyName: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  krsLink?: string
  adresPelny?: string
  zrodlo?: string
}

export function SidebarActions({ companyName, address, contact, krsLink, adresPelny, zrodlo }: SidebarActionsProps) {
  const mapQuery = encodeURIComponent(
    adresPelny || `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`
  )

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Akcje</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {krsLink && (
            <Button className="w-full justify-start" size="sm" asChild>
              <a href={krsLink} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Pobierz odpis {zrodlo || 'KRS'}
              </a>
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Raport finansowy
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Star className="mr-2 h-4 w-4" />
            Dodaj do obserwowanych
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Powiadomienia o zmianach
          </Button>
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" className="flex-1">
              <Share2 className="mr-1.5 h-4 w-4" />
              Udostepnij
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Printer className="mr-1.5 h-4 w-4" />
              Drukuj
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2.5">
            <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="font-medium text-foreground">{companyName}</p>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-muted-foreground">
              {adresPelny ? (
                <p>{adresPelny}</p>
              ) : (
                <>
                  <p>{address.street}</p>
                  <p>{address.postalCode} {address.city}</p>
                  <p>{address.country}</p>
                </>
              )}
            </div>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.website && (
            <div className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {contact.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Lokalizacja</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-b-lg">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=20.85,51.95,21.15,52.35&layer=mapnik"
              className="h-full w-full border-0"
              title="Company location map"
              loading="lazy"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-card transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Otworz mape
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
