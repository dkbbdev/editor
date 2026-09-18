import WebSocket from 'ws'
const TAB = process.argv[2], x = +process.argv[3], y = +process.argv[4]
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + TAB, { maxPayload: 64e6 })
let id = 0
const send = (method, params) => new Promise(res => {
  const i = ++id
  const on = m => { const o = JSON.parse(m); if (o.id === i) { ws.off('message', on); res(o) } }
  ws.on('message', on); ws.send(JSON.stringify({ id: i, method, params }))
})
const sleep = ms => new Promise(r => setTimeout(r, ms))
ws.on('open', async () => {
  // sweep เมาส์เข้าจากนอก canvas
  for (let i = 0; i <= 8; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x - 100 + i * 12, y: y - 60 + i * 7 })
    await sleep(60)
  }
  await sleep(300)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
  await sleep(80)
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
  console.log('full sequence done at', x, y)
  ws.close(); process.exit(0)
})
