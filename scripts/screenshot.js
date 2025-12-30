const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

;(async ()=>{
  const outDir = path.join(__dirname,'output')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const base = process.env.BASE_URL || 'http://localhost:3000'

  const pages = [
    { path: '/', name: 'home' },
    { path: '/recommendations', name: 'recommendations' },
    { path: '/watchlist', name: 'watchlist' },
    { path: '/title/1', name: 'title-1' },
    { path: '/donate', name: 'donate' },
    { path: '/subscription-detail', name: 'subscription' }
  ]

  console.log('Capturing screenshots to', outDir)
  for (const p of pages){
    const url = base + p.path
    console.log('->', url)
    try{
      await page.goto(url, { waitUntil: 'networkidle' , timeout: 15000})
      await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true })
    }catch(err){
      console.error('Failed to capture', url, err.message)
    }
  }

  await browser.close()
  console.log('Done')
})().catch(err=>{ console.error(err); process.exit(1) })
