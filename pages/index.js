import Header from '../components/Header'
import Card from '../components/Card'
import mapping from '../data/mapping.json'
import Link from 'next/link'

export default function Home(){
  const recs = mapping.recommendations
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <section className="card mb-6">
          <h2 className="text-xl font-bold">Best subscription for you this month</h2>
          <p className="small-muted">Netflix — 8 matches from your watchlist · Estimated value: $X</p>
          <div className="mt-4">
            <Link href="/subscription-detail" className="px-4 py-2 bg-accent text-white rounded">View details</Link>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Recommended for you</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recs.map(r => <Card key={r.id} item={r} />)}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3">New releases this week</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">New Release 1</div>
            <div className="card">New Release 2</div>
            <div className="card">New Release 3</div>
            <div className="card">New Release 4</div>
          </div>
        </section>
      </main>
    </div>
  )
}
