import Link from 'next/link'
import PolicyShell from '../components/policy/PolicyShell'
import PolicyBlocks from '../components/policy/PolicyBlocks'
import { POLICIES, POLICY_CONTACT_EMAIL } from '../lib/policies'

export default function Terms() {
  const policy = POLICIES.terms
  const tocItems = policy.sections.map((s) => ({ id: s.id, label: s.heading }))

  return (
    <PolicyShell
      title={policy.title}
      description={policy.description}
      lastUpdated={policy.lastUpdated}
      pdfHref={`/api/policy-pdf?doc=${policy.key}`}
      pdfFileName={`flico-${policy.key}.pdf`}
      tocItems={tocItems}
    >
      <div className="space-y-10">
        {policy.sections.map((s) => (
          <section key={s.id} className="pb-10 border-b border-white/10 last:border-none">
            <h2 id={s.id} className="scroll-mt-28 text-2xl font-bold text-white mb-4">
              {s.heading}
            </h2>
            <PolicyBlocks blocks={s.blocks} />
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
