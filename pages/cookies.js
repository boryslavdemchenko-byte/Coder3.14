import Link from 'next/link'
import PolicyShell from '../components/policy/PolicyShell'
import PolicyBlocks from '../components/policy/PolicyBlocks'
import { POLICIES, POLICY_CONTACT_EMAIL } from '../lib/policies'

export default function Cookies() {
  const policy = POLICIES.cookies
  const tocItems = policy.sections.map((s) => ({ id: s.id, label: s.heading }))

  return (
    <PolicyShell
      title={policy.title}
      description={policy.description}
      lastUpdated={policy.lastUpdated}
      pdfHref={`/api/policy-pdf?doc=${policy.key}`}
      pdfFileName={`flico-${policy.key}.pdf`}
      tocItems={tocItems}
      topSlot={
        <div className="mb-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-white font-bold text-lg">Manage cookie preferences</div>
              <p className="text-gray-400 text-sm mt-1">
                Update your choices for functional, analytics, and advertising cookies.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.dispatchEvent(new Event('flico:open-cookie-preferences'))
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
            >
              Open cookie settings
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-300">
            Prefer reading first? Jump to <a href="#cookie-categories" className="text-blue-400 hover:underline">cookie categories</a>.
          </div>
        </div>
      }
    >
      <div className="space-y-10">
        <div className="text-sm text-gray-400">
          Related: <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
        </div>
        {policy.sections.map((s) => (
          <section key={s.id} className="pb-10 border-b border-white/10 last:border-none">
            <h2 id={s.id} className="scroll-mt-28 text-2xl font-bold text-white mb-4">
              {s.heading}
            </h2>
            <PolicyBlocks blocks={s.blocks} />
            {s.id === 'manage-preferences' && (
              <div className="mt-6 rounded-2xl bg-black/20 border border-white/10 p-5">
                <div className="text-white font-bold">Quick actions</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') window.dispatchEvent(new Event('flico:open-cookie-preferences'))
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition font-bold"
                  >
                    Open cookie settings
                  </button>
                  <Link
                    href="/privacy#cookies"
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition font-semibold text-center"
                  >
                    See privacy details
                  </Link>
                </div>
              </div>
            )}
            {s.id === 'contact' && (
              <div className="mt-6 rounded-2xl bg-black/20 border border-white/10 p-5">
                <div className="text-white font-bold">Contact options</div>
                <div className="mt-2 text-gray-300 text-sm">
                  Email: <a className="text-blue-400 hover:underline" href={`mailto:${POLICY_CONTACT_EMAIL}`}>{POLICY_CONTACT_EMAIL}</a>
                </div>
                <div className="mt-2 text-gray-300 text-sm">
                  Contact page: <Link href="/contact" className="text-blue-400 hover:underline">Open contact page</Link>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </PolicyShell>
  )
}
