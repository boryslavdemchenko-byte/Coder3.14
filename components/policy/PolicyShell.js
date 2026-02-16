import { useMemo, useState } from 'react'
import Layout from '../Layout'
import useActiveHeading from './useActiveHeading'
import PolicyToc from './PolicyToc'

export default function PolicyShell({ title, description, lastUpdated, pdfHref, pdfFileName, tocItems, topSlot, children }) {
  const ids = useMemo(() => (tocItems || []).map((t) => t.id), [tocItems])
  const activeId = useActiveHeading(ids)
  const [tocOpen, setTocOpen] = useState(false)

  function navigateTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${id}`)
    setTocOpen(false)
  }

  return (
    <Layout title={`${title} - Flico`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
            <p className="text-gray-400 leading-relaxed max-w-2xl">{description}</p>
            <div className="text-xs text-gray-500 font-medium">Last updated: {lastUpdated}</div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={pdfHref}
              download={pdfFileName}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 text-white text-sm font-semibold transition"
            >
              <span>Download PDF</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 16a.75.75 0 0 1-.53-.22l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V4.75a.75.75 0 0 1 1.5 0v9.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3A.75.75 0 0 1 12 16Z" />
                <path d="M4.5 19.5A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 19.5v-2.25a.75.75 0 0 0-1.5 0v2.25c0 .414-.336.75-.75.75H6.75a.75.75 0 0 1-.75-.75v-2.25a.75.75 0 0 0-1.5 0v2.25Z" />
              </svg>
            </a>
          </div>
        </div>

        {topSlot}

        <div className="lg:hidden mb-6">
          <button
            type="button"
            onClick={() => setTocOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold"
            aria-expanded={tocOpen}
          >
            <span>On this page</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${tocOpen ? 'rotate-180' : ''}`}>
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          {tocOpen && (
            <div className="mt-3 rounded-2xl bg-black/30 border border-white/10 p-2">
              <PolicyToc items={tocItems} activeId={activeId} onNavigate={navigateTo} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl bg-black/20 border border-white/10 p-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">On this page</div>
              <PolicyToc items={tocItems} activeId={activeId} onNavigate={navigateTo} />
            </div>
          </aside>
          <article className="min-w-0">{children}</article>
        </div>
      </div>
    </Layout>
  )
}

