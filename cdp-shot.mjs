import WebSocket from 'ws'
import fs from 'fs'
const TAB = process.argv[2], out = process.argv[3]
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + TAB, { maxPayload: 128e6 })
let id = 0
const send = (m, p) => new Promise(res => { const i = ++id; const on = msg => { const o = JSON.parse(msg); if (o.id === i) { ws.off('message', on); res(o) } }; ws.on('message', on); ws.send(JSON.stringify({ id: i, method: m, params: p })) })
ws.on('open', async () => {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(out, Buffer.from(r.result.data, 'base64'))
  console.log('saved', out)
  ws.close(); process.exit(0)
})
