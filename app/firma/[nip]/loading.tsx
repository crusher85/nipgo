export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* Navbar */}
      <header className="bg-white border-b border-[#e5e7eb] h-14 px-6 flex items-center justify-between">
        <div className="w-16 h-4 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-20 h-8 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-24 h-8 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 pt-5 pb-20">

        {/* Breadcrumb */}
        <div className="w-28 h-3 rounded bg-gray-200 animate-pulse mb-5" />

        {/* Hero */}
        <div className="mb-7">
          <div className="flex gap-2 mb-3">
            <div className="w-16 h-5 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-24 h-5 rounded-full bg-gray-100 animate-pulse" />
          </div>
          <div className="w-96 h-8 rounded bg-gray-200 animate-pulse mb-3" />
          <div className="flex gap-6 mb-5">
            <div className="w-28 h-3 rounded bg-gray-100 animate-pulse" />
            <div className="w-28 h-3 rounded bg-gray-100 animate-pulse" />
            <div className="w-24 h-3 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-28 h-9 rounded-lg bg-gray-100 animate-pulse" />
            <div className="w-24 h-9 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 rounded-xl border border-[#e5e7eb] bg-white overflow-hidden mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`p-5 ${i < 3 ? "border-r border-[#e5e7eb]" : ""}`}>
              <div className="w-5 h-5 rounded bg-gray-100 animate-pulse mb-3" />
              <div className="w-20 h-2.5 rounded bg-gray-100 animate-pulse mb-2" />
              <div className="w-24 h-5 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#e5e7eb] mb-6">
          {[80, 64, 56, 72, 72].map((w, i) => (
            <div key={i} className="px-5 py-3.5">
              <div className={`h-4 rounded bg-gray-${i === 0 ? "200" : "100"} animate-pulse`} style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex gap-6 items-start">

          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Dane rejestrowe */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <div className="w-32 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
              {[90, 60, 70, 100, 50, 40, 30, 20].map((w, i) => (
                <div key={i} className="flex gap-6 px-5 py-3 border-b border-[#e5e7eb] last:border-0">
                  <div className="w-36 h-3 rounded bg-gray-100 animate-pulse shrink-0" />
                  <div className="h-3 rounded bg-gray-200 animate-pulse" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>

            {/* Zarząd */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
              {[0, 1].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e5e7eb] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-40 h-3 rounded bg-gray-200 animate-pulse" />
                    <div className="w-24 h-2.5 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Sidebar */}
          <aside className="w-72 shrink-0 self-start space-y-4">

            {/* Map */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
              <div className="w-full bg-gray-100 animate-pulse" style={{ aspectRatio: "4/3" }} />
              <div className="px-4 py-3 border-t border-[#e5e7eb]">
                <div className="w-48 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>

            {/* Akcje */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <div className="w-12 h-3 rounded bg-gray-200 animate-pulse mb-4" />
              <div className="space-y-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-full h-9 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Sprawozdania */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <div className="w-40 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-3 border-b border-[#e5e7eb] last:border-0">
                  <div className="w-4 h-4 rounded bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 h-3 rounded bg-gray-200 animate-pulse" />
                  <div className="w-3 h-3 rounded bg-gray-100 animate-pulse shrink-0" />
                </div>
              ))}
            </div>

            {/* Pro CTA */}
            <div className="rounded-xl bg-blue-100 animate-pulse h-32" />

          </aside>
        </div>
      </div>
    </div>
  )
}
