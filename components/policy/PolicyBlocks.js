import Link from 'next/link'

export default function PolicyBlocks({ blocks }) {
  return (
    <div className="space-y-4">
      {(blocks || []).map((b, idx) => {
        if (b.type === 'p') {
          return (
            <p key={idx} className="text-gray-300 leading-relaxed">
              {renderInline(b.text)}
            </p>
          )
        }
        if (b.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-6 text-gray-300 space-y-2">
              {(b.items || []).map((it) => (
                <li key={it}>{renderInline(it)}</li>
              ))}
            </ul>
          )
        }
        return null
      })}
    </div>
  )
}

function renderInline(text) {
  if (typeof text !== 'string') return text

  const parts = splitByLinks(text)
  return parts.map((p, i) => {
    if (p.type === 'text') return <span key={i}>{p.value}</span>
    if (p.type === 'link' && p.href.startsWith('/')) {
      return (
        <Link key={i} href={p.href} className="text-blue-400 hover:text-blue-300 hover:underline">
          {p.label}
        </Link>
      )
    }
    return (
      <a key={i} href={p.href} className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
        {p.label}
      </a>
    )
  })
}

function splitByLinks(text) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const out = []
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) out.push({ type: 'text', value: text.slice(last, match.index) })
    out.push({ type: 'link', label: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
}

