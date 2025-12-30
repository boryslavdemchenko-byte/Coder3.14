import Header from '../components/Header'

export default function SubscriptionDetail(){
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Subscription details</h2>
        <p className="small-muted">Netflix · $15.99/month · 8 matches</p>
        <div className="mt-6">
          <button className="px-4 py-2 bg-accent text-white rounded">Manage Subscription</button>
        </div>
      </main>
    </div>
  )
}
