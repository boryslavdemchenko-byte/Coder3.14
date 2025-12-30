import Header from '../components/Header'
import { useState } from 'react'
import Toast from '../components/Toast'

export default function Donate(){
  const [toast, setToast] = useState('')
  function donate(amount){
    // Simulate donation flow for prototype
    setToast(`Simulated donation: $${amount}`)
    setTimeout(()=>setToast(''), 4000)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Support StreamPlanner</h2>
        <p className="small-muted">Help keep prototypes free and open — your donation helps cover hosting & design costs.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={()=>donate(5)} className="px-4 py-2 bg-accent text-white rounded" type="button">Donate $5</button>
          <button onClick={()=>donate(10)} className="px-4 py-2 bg-accent text-white rounded" type="button">Donate $10</button>
          <button onClick={()=>donate(25)} className="px-4 py-2 bg-accent text-white rounded" type="button">Donate $25</button>
        </div>
      </main>
      <Toast message={toast} onClose={()=>setToast('')} />
    </div>
  )
}
