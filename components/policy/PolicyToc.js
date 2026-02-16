export default function PolicyToc({ items, activeId, onNavigate }) {
  return (
    <nav aria-label="On this page" className="space-y-2">
      {(items || []).map((it) => {
        const isActive = it.id === activeId
        return (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={(e) => {
              e.preventDefault()
              onNavigate?.(it.id)
            }}
            className={`block rounded-lg px-3 py-2 text-sm transition border ${
              isActive
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                : 'bg-white/0 border-white/0 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {it.label}
          </a>
        )
      })}
    </nav>
  )
}

