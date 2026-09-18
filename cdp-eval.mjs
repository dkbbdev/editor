import WebSocket from 'ws'
const TAB = process.argv[2], exprs = process.argv.slice(3)
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + TAB, { maxPayload: 64 * 1024 * 1024 })
let id = 0
ws.on('open', async () => {
  for (const e of exprs) {
    const r = await new Promise(res => {
      const i = ++id
      const on = msg => { const m = JSON.parse(msg); if (m.id === i) { ws.off('message', on); res(m) } }
      ws.on('message', on)
      ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression: e, returnByValue: true, awaitPromise: true } }))
    })
    const v = r?.result?.result?.value ?? JSON.stringify(r?.result ?? r)
    console.log('== ' + e.slice(0, 90)); console.log(typeof v === 'string' ? v : JSON.stringify(v))
  }
  ws.close(); process.exit(0)
})
ws.on('error', e => { console.error('WS ERR', e.message); process.exit(1) })
