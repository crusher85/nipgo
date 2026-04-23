import type { Metadata } from "next"
import HomePage from "./HomeClient"

const BASE_URL = "https://nipgo.pl"

export const metadata: Metadata = {
  title: "nipgo.pl — Znajdź każdą firmę w Polsce",
  description: "Ponad 3 miliony firm i JDG z KRS i CEIDG. Wyszukaj po nazwie, NIP, miejscowości lub PKD. Dane rejestrowe, kontaktowe i weryfikacja VAT — za darmo.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "nipgo.pl — Znajdź każdą firmę w Polsce",
    description: "Ponad 3 miliony firm z KRS i CEIDG. Wyszukaj po nazwie, NIP, PKD lub miejscowości.",
    url: BASE_URL,
  },
}

function SearchActionJsonLd() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": BASE_URL,
    name: "nipgo.pl",
    url: BASE_URL,
    description: "Polska baza firm KRS i CEIDG — ponad 3 miliony podmiotów",
    inLanguage: "pl-PL",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}

export default function Page() {
  return (
    <>
      <SearchActionJsonLd />
      <HomePage />
    </>
  )
}
