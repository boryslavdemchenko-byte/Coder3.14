const path = require('path')
function check(p){
  try{
    const mod = require(path.join(process.cwd(), p))
    console.log(p, '->', Object.keys(mod), 'default type:', typeof mod.default)
  }catch(e){
    console.error(p, 'ERROR:', e.message)
  }
}
check('components/Header.js')
check('components/Card.js')
check('components/Modal.js')
check('components/Toast.js')
check('pages/_app.js')
check('pages/index.js')
check('pages/recommendations.js')
check('pages/watchlist.js')
check('pages/title/[id].js')
