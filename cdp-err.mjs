import WebSocket from 'ws'
const TAB = process.argv[2]
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + TAB, { maxPayload: 64e6 })
ws.on('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }))
  ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }))
  const seen = []
  ws.on('message', m => {
    const o = JSON.parse(m)
    if (o.method === 'Runtime.exceptionThrown') seen.push('EXC: ' + (o.params.exceptionDetails?.exception?.description || o.params.exceptionDetails?.text || '').slice(0, 300))
    if (o.method === 'Log.entryAdded') { const e = o.params.entry; if (e.level === 'error') seen.push('LOG: ' + (e.text + ' ' + (e.url || '')).slice(0, 200)) }
  })
  setTimeout(() => { console.log(seen.length ? seen.join('\n') : 'no errors'); process.exit(0) }, 3000)
})
