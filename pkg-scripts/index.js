const OSC = require('osc-js')
const OSC_PORT = 9129

console.log(`********* Started OSC Bridge: on port ${OSC_PORT} ********* `)

const config = { udpClient: { port: OSC_PORT } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })

osc.open() // start a WebSocket server on port 8080