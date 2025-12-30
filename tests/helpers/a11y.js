const axeCore = require('axe-core')

async function injectAxe(page){
  await page.addScriptTag({ content: axeCore.source })
}

async function checkA11y(page, options){
  return await page.evaluate(async (opts) => await axe.run(document, opts), options || {})
}

module.exports = { injectAxe, checkA11y }
