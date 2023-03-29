const OSC = require('osc-js')
const OSC_PORT = 57120

console.log(`Started OSC Bridge: on port ${OSC_PORT}`)

const config = { udpClient: { port: OSC_PORT } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
osc.open() // internal communication WebSocket on port 8080
osc.on('open', (msg) => { console.log("[osc::server::open]", msg) });
osc.on('close', (msg) => { console.log("[osc::server::close]", msg); osc.close(); });
osc.on('error', (err) => { console.log("[osc::server::err]", err); osc.close(); });