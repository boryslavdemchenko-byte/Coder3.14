const { test, expect } = require('@playwright/test');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');

const pages = ['/', '/recommendations', '/watchlist', '/title/1', '/donate', '/subscription-detail'];

const outDir = path.join(process.cwd(),'scripts','output');
fs.mkdirSync(outDir, { recursive: true });
const resultsPath = path.join(outDir, 'axe-results.json');

for (const p of pages) {
  test(`a11y: ${p}`, async ({ page }) => {
    await page.goto(p);
    await page.waitForLoadState('networkidle');

    // inject axe-core
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => await axe.run());

    // transform violations to a compact structure
    const compact = (results.violations || []).map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));

    // append to results file (read existing, append, write)
    try{
      const existing = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath,'utf8')) : [];
      existing.push({ page: p, violations: compact });
      fs.writeFileSync(resultsPath, JSON.stringify(existing, null, 2));
    }catch(err){
      console.error('Failed to write axe results file:', err.message);
    }

    // if violations exist, print a brief summary for easier debugging
    if (compact.length > 0) {
      console.log(`Found ${compact.length} axe violations on ${p}:`);
      for (const v of compact) {
        console.log(`- ${v.id}: ${v.nodes} nodes (impact: ${v.impact})`);
      }
    }

    expect(results.violations).toEqual([]);
  });
}
