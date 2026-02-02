import { useState } from 'react'
import Layout from '../components/Layout'

export default function Donate(){
  const [amount, setAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(false)

  const PRESETS = [5, 10, 25]

  function handlePresetClick(val) {
    setAmount(val)
    setIsCustom(false)
    setCustomAmount('')
  }

  function handleCustomFocus() {
    setIsCustom(true)
    setAmount(0)
  }

  function handleCustomChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '')
    setCustomAmount(val)
    setAmount(Number(val))
  }

  function getCurrencyFromRegion() {
    try {
      const region = localStorage.getItem('flico_region') || ''
      const r = region.toUpperCase()
      if (['US', 'CA', 'AU'].includes(r)) return r === 'CA' ? 'cad' : r === 'AU' ? 'aud' : 'usd'
      if (['DE', 'FR', 'ES', 'IT', 'NL'].includes(r)) return 'eur'
      if (['GB', 'UK'].includes(r)) return 'gbp'
      return 'usd'
    } catch {
      return 'usd'
    }
  }

  async function handleDonate() {
    if (amount <= 0) return
    setLoading(true)
    setNotice(true)
    setTimeout(() => {
      window.open('https://donate.stripe.com/test_00w8wI2Sx6Kb6OU93X6Na00', '_blank', 'noopener,noreferrer')
      setTimeout(() => setLoading(false), 500)
    }, 4200)
  }

  return (
    <Layout title="Donate - Support Flico">
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-lg">
          
          <div className="card flex-col border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden bg-[var(--card)]">
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Keep Flico independent & free
                </h1>
                <p className="text-gray-400 leading-relaxed">
                  We rely on donations from users like you to cover hosting, design, and development costs. 
                  Your support ensures Flico stays ad-free and open for everyone.
                </p>
              </div>

              {/* Amount Selection */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`
                      relative py-3 px-2 rounded-xl font-semibold border transition-all
                      ${!isCustom && amount === preset 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/50' 
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                      }
                    `}
                  >
                    ${preset}
                    {!isCustom && amount === preset && preset === 10 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-400 text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                        Best
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-8">
                <div className={`
                  relative flex items-center border rounded-xl transition-all overflow-hidden
                  ${isCustom 
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-gray-800' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                  }
                `}>
                  <div className="pl-4 text-gray-400 font-medium">$</div>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Other amount"
                    value={customAmount}
                    onFocus={handleCustomFocus}
                    onChange={handleCustomChange}
                    className="w-full py-3 px-2 outline-none bg-transparent text-white font-medium placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Action Button */}
              {notice && (
                <div className="mb-3 p-3 rounded-lg border border-gray-700 bg-black/40 text-gray-300 text-sm">
                  You will be redirected to a secure Stripe page in a new tab.
                </div>
              )}
              <button
                onClick={handleDonate}
                disabled={amount <= 0 || loading}
                className={`
                  w-full py-3.5 rounded-xl font-bold text-white text-lg shadow-lg transition-all
                  flex items-center justify-center gap-2
                  ${amount > 0 && !loading
                    ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-900/50 hover:-translate-y-0.5' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <>Processing…</>
                ) : (
                  <>Donate {amount > 0 ? `$${amount}` : ''}</>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure payment via Stripe</span>
                </div>
                <p className="text-xs text-gray-500">
                  No account required. You can cancel monthly donations anytime.
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  )
}
