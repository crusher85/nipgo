import type { Metadata } from "next"
import "./globals.css"
import { LayoutWrapper } from "@/components/LayoutWrapper"

const BASE_URL = "https://nipgo.pl"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "nipgo.pl — Baza firm KRS i CEIDG | Dane, kontakty, weryfikacja",
    template: "%s | nipgo.pl",
  },
  description: "Ponad 3 miliony firm i JDG z KRS i CEIDG. Dane rejestrowe, kontaktowe, status VAT, kapitał, zarząd. Darmowe wyszukiwanie, eksport CSV, monitoring zmian.",
  keywords: "baza firm polska, KRS, CEIDG, dane firmy po NIP, weryfikacja kontrahenta, wyszukiwarka firm, rejestr przedsiębiorców, status VAT",
  authors: [{ name: "AuraData", url: BASE_URL }],
  creator: "AuraData",
  publisher: "nipgo.pl",
  category: "business",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: BASE_URL,
    siteName: "nipgo.pl",
    title: "nipgo.pl — Baza firm KRS i CEIDG",
    description: "Ponad 3 miliony firm i JDG z KRS i CEIDG. Dane rejestrowe, kontaktowe, status VAT. Darmowe wyszukiwanie.",
    images: [{
      url: "/og-default.png",
      width: 1200,
      height: 630,
      alt: "nipgo.pl — Polska baza firm",
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nipgopl",
    title: "nipgo.pl — Baza firm KRS i CEIDG",
    description: "Ponad 3 miliony firm z KRS i CEIDG. Dane rejestrowe, kontaktowe i weryfikacja VAT.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "pl-PL": BASE_URL,
      // "en-US": `${BASE_URL}/en`,  // odkomentuj gdy będzie i18n
    },
  },
  // verification: { google: "TWÓJ_KOD" },  // dodaj po Search Console
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, padding: 0 }}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
