"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SearchItem = {
  nip: string | null;
  nazwa_pelna: string | null;
  forma_prawna: string | null;
  miejscowosc: string | null;
  wojewodztwo: string | null;
  status: string | null;
  adres_pelny: string | null;
  zrodlo: "CEIDG" | "KRS";
};

type SearchResponse =
  | { redirect: true; nip: string }
  | { redirect: false; results: SearchItem[]; total?: number };

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = useMemo(() => (searchParams.get("q") ?? "").trim(), [searchParams]);

  const [results, setResults] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setResults(null);

      if (!q) return;

      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as any;
        throw new Error(payload?.error ?? "Błąd wyszukiwania");
      }

      const data = (await res.json()) as SearchResponse;

      if (cancelled) return;

      if ("redirect" in data && data.redirect && data.nip) {
        router.replace(`/firma/${data.nip}`);
        return;
      }

      if ("results" in data) {
        setResults(data.results ?? []);
      }
    }

    run().catch((e: unknown) => {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : "Błąd wyszukiwania");
    });

    return () => {
      cancelled = true;
    };
  }, [q, router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans">
      <header className="px-8 py-6">
        <div className="flex items-center">
          <Link href="/" aria-label="nipgo - strona główna" className="flex items-center gap-2">
            <span className="text-[22px] font-bold text-[#111827]">nipgo</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-start px-8 pb-16 pt-10">
        <div className="w-full text-center">
          <h1 className="text-[36px] font-bold leading-tight">
            Znajdź każdą firmę w Polsce
          </h1>
          <p className="mt-3 text-[16px] text-[#6B7280]">
            Baza CEIDG i KRS — ponad milion przedsiębiorców
          </p>

          <form method="GET" action="/" className="mx-auto mt-8 w-full max-w-[560px]">
            <label htmlFor="q" className="sr-only">
              Szukaj firmy
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
              <svg className="h-5 w-5 shrink-0 text-[#6B7280]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <input
                id="q"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="NIP, nazwa firmy lub miejscowość..."
                defaultValue={q}
                className="w-full bg-transparent text-[#111827] placeholder:text-[#6B7280] outline-none"
              />

              <button
                type="submit"
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-[14px] font-semibold text-white"
              >
                Szukaj
              </button>
            </div>
          </form>

          {(error || results) && (
            <div className="mx-auto mt-6 w-full max-w-[560px] text-left">
              {error && (
                <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#6B7280]">
                  {error}
                </div>
              )}

              {results && results.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                  <ul className="divide-y divide-[#E5E7EB]">
                    {results.map((item) => {
                      const nip = item.nip ?? "";
                      return (
                        <li key={`${item.zrodlo}-${nip}-${item.nazwa_pelna ?? ""}`}>
                          <Link
                            href={nip ? `/firma/${nip}` : "/"}
                            className="block px-5 py-4 hover:bg-[#FAFAFA]"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-[#111827]">
                                  {item.nazwa_pelna ?? "—"}
                                </p>
                                <p className="mt-1 text-sm text-[#6B7280]">
                                  {[item.miejscowosc, item.wojewodztwo].filter(Boolean).join(", ") || "—"}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-sm text-[#6B7280]">
                                  {item.zrodlo}
                                </p>
                                <p className="mt-1 font-mono text-sm text-[#6B7280]">{nip || "—"}</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
