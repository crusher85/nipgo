import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans">
      <header className="w-full px-6 py-5">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:opacity-90"
            aria-label="nipgo - strona główna"
          >
            nipgo
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-78px)] flex-1 items-center justify-center px-6">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Znajdź każdą firmę w Polsce
          </h1>

          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            Wpisz nazwę firmy, NIP lub lokalizację.
          </p>

          <form
            method="GET"
            action="/"
            className="mx-auto mt-10 w-full max-w-2xl"
          >
            <label htmlFor="q" className="sr-only">
              Szukaj firmy
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <svg
                className="h-5 w-5 shrink-0 text-zinc-300"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="q"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="np. Allegro, 123-45-67-890, Warszawa"
                className="w-full bg-transparent text-zinc-50 placeholder:text-zinc-500 outline-none"
              />

              <button type="submit" className="sr-only">
                Szukaj
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
