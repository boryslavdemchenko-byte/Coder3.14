import { useEffect, useState } from 'react'

export default function useActiveHeading(ids) {
  const [activeId, setActiveId] = useState(ids[0] || '')

  useEffect(() => {
    if (!ids?.length) return
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (!visible.length) return
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActiveId(visible[0].target.id)
      },
      { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0.1] }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

