export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { amount, currency } = req.body || {}
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' })
  }
  const curr = (currency || 'usd').toLowerCase()
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return res.status(500).json({ error: 'Stripe key not configured' })
  }

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?success=true`)
  params.append('cancel_url', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?canceled=true`)
  params.append('payment_method_types[]', 'card')
  params.append('line_items[0][price_data][currency]', curr)
  params.append('line_items[0][price_data][product_data][name]', 'Flico Donation')
  params.append('line_items[0][price_data][unit_amount]', Math.round(amount * 100))
  params.append('line_items[0][quantity]', '1')

  try {
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await resp.json()
    if (!resp.ok) {
      return res.status(500).json({ error: data.error?.message || 'Stripe error' })
    }
    return res.status(200).json({ id: data.id, url: data.url })
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
